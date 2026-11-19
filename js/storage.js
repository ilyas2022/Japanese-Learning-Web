// Progreso guardado en localStorage del dispositivo.
(function () {
  const KEY = 'nihongo-diario-v1';

  const defaults = () => ({
    v: 2,
    settings: { romaji: true, perDay: 5, rate: 0.85, theme: 'auto', fun: true, adult: true, reviewMode: 'mix' },
    srs: {},          // id -> { due, ivl, ease, reps, lapses, added }
    daily: null,      // { day, ids:[], step:'learn'|'quiz'|'done' }
    streak: { count: 0, last: null, best: 0 },
    kana: {},         // 'h:あ' -> { c, w, s }
    log: {},          // day -> { learned, reviews }
    nums: {},         // modo de práctica de números -> { ok, n }
    dayOffset: 0,     // solo para pruebas
  });

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const d = defaults();
      state = parsed ? { ...d, ...parsed, settings: { ...d.settings, ...(parsed.settings || {}) } } : d;
    } catch (e) {
      state = defaults();
    }
    if (migrate(state)) { state.updatedAt = Date.now(); write(); } // la versión migrada pasa a ser la más reciente
    return state;
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin espacio / modo privado */ }
  }
  function save() {
    state.updatedAt = Date.now();
    write();
    if (window.Sync) Sync.schedule();
  }
  // Sustituir el estado entero (al bajar de la nube) sin marcarlo como cambio local
  function replace(obj) {
    const d = defaults();
    state = { ...d, ...obj, v: obj.v || 1, settings: { ...d.settings, ...(obj.settings || {}) } };
    if (migrate(state)) state.updatedAt = Date.now();
    write();
  }

  // v1 → v2: el contenido pasó de ids por posición (v12, p-basicas-3) a ids por texto japonés.
  // Se conservan las tarjetas que siguen existiendo; las palabras eliminadas se borran.
  function migrate(st) {
    if ((st.v || 1) >= 2) return false;
    const map = window.LEGACY_MAP || {};
    const srs = {}; let kept = 0, dropped = 0;
    Object.entries(st.srs || {}).forEach(([id, c]) => {
      const n = map[id];
      if (!n) { dropped++; return; }
      if (!srs[n]) { kept++; srs[n] = c; } else if ((c.ivl || 0) > (srs[n].ivl || 0)) srs[n] = c;
    });
    st.srs = srs; st.daily = null; st.nums = st.nums || {};
    if (st.settings) delete st.settings.focus;
    st.v = 2;
    if (kept || dropped) st.migrated = { kept, dropped, seen: false };
    return true;
  }

  // Número de día local (cambia a medianoche en tu zona horaria)
  function today() {
    const d = new Date();
    const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(local / 86400000) + (state ? state.dayOffset || 0 : 0);
  }

  function logDay(field, n = 1) {
    const t = today();
    state.log[t] = state.log[t] || { learned: 0, reviews: 0 };
    state.log[t][field] += n;
  }

  function exportJSON() { return JSON.stringify(state, null, 2); }
  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || !parsed.srs) throw new Error('Archivo no válido');
    const sync = state && state.sync;
    replace({ ...parsed, v: parsed.v || 1, sync });
    save(); // la copia importada pasa a ser la versión más reciente (también en la nube)
  }
  function reset() {
    const sync = state && state.sync; // mantener el código de sincronización
    state = defaults(); if (sync) state.sync = sync; save();
  }

  window.Store = {
    load, save, replace, write, today, logDay, exportJSON, importJSON, reset,
    get s() { return state; },
  };
})();
