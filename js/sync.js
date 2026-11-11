// Sincronización con la nube (Vercel + Upstash Redis) usando un código secreto.
// Estrategia: gana la versión más reciente (updatedAt). Se sube 3 s después de cada cambio
// y al salir de la app; se baja al abrirla o volver a ella.
(function () {
  const API = '/api/progress';
  let timer = null;
  let busy = false;
  const listeners = [];

  const code = () => Store.s.sync && Store.s.sync.code;
  const status = { state: 'off', msg: '' }; // off | ok | syncing | error | unconfigured
  function set(state, msg = '') { status.state = state; status.msg = msg; listeners.forEach((f) => f(status)); }

  function newCode() {
    const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    return Array.from(bytes, (b) => abc[b % abc.length]).join('');
  }
  function payload() {
    const { sync, ...data } = Store.s; // el código no viaja dentro de los datos
    return { updatedAt: Store.s.updatedAt || Date.now(), data };
  }

  async function push(keepalive = false) {
    if (!code()) return;
    clearTimeout(timer); timer = null;
    try {
      set('syncing');
      const r = await fetch(`${API}?code=${code()}`, {
        method: 'PUT', keepalive, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()),
      });
      if (r.status === 503) return set('unconfigured', 'Falta conectar la base de datos en Vercel');
      if (!r.ok) throw new Error(r.status);
      Store.s.sync.last = Date.now(); persistSyncMeta();
      set('ok');
    } catch (e) { set('error', navigator.onLine ? 'No se pudo sincronizar' : 'Sin conexión: se subirá luego'); }
  }

  // Devuelve true si se ha sustituido el estado local por el de la nube
  async function pull() {
    if (!code() || busy) return false;
    busy = true;
    try {
      set('syncing');
      const r = await fetch(`${API}?code=${code()}`, { cache: 'no-store' });
      if (r.status === 503) { set('unconfigured', 'Falta conectar la base de datos en Vercel'); return false; }
      if (r.status === 404) { await push(); return false; }
      if (!r.ok) throw new Error(r.status);
      const remote = await r.json();
      const localAt = Store.s.updatedAt || 0;
      if (remote.updatedAt > localAt) {
        const sync = { ...Store.s.sync, last: Date.now() };
        Store.replace({ ...remote.data, updatedAt: remote.updatedAt, sync });
        set('ok');
        return true;
      }
      if (remote.updatedAt < localAt) await push();
      else { Store.s.sync.last = Date.now(); persistSyncMeta(); set('ok'); }
      return false;
    } catch (e) {
      set('error', navigator.onLine ? 'No se pudo sincronizar' : 'Sin conexión');
      return false;
    } finally { busy = false; }
  }

  // Guardar metadatos de sync sin cambiar updatedAt (para no provocar subidas en bucle)
  function persistSyncMeta() { Store.write(); }

  function schedule() {
    if (!code()) return;
    clearTimeout(timer);
    timer = setTimeout(() => push(), 3000);
  }

  // Activar en este dispositivo: nuevo código, o uno existente (de otro móvil)
  async function enable(existing) {
    const c = existing ? existing.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : newCode();
    if (c.length < 16) throw new Error('Código no válido');
    if (existing) {
      const r = await fetch(`${API}?code=${c}`, { cache: 'no-store' });
      if (r.status === 404) throw new Error('No existe ese código');
      if (r.status === 503) throw new Error('Falta conectar la base de datos en Vercel');
      if (!r.ok) throw new Error('No se pudo conectar');
      const remote = await r.json();
      // Con un código existente, la nube manda
      Store.replace({ ...remote.data, updatedAt: remote.updatedAt, sync: { code: c, last: Date.now() } });
      set('ok');
      return true;
    }
    Store.s.sync = { code: c, last: null };
    persistSyncMeta();
    await push();
    return false;
  }
  function disable() { delete Store.s.sync; persistSyncMeta(); clearTimeout(timer); set('off'); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer) push(true); // subir lo pendiente al salir
  });
  window.addEventListener('online', () => { if (code()) push(); });

  window.Sync = {
    enable, disable, pull, push, schedule, status,
    onChange: (f) => listeners.push(f),
    get code() { return code(); },
  };
})();
