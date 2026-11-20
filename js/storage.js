// Progreso guardado en localStorage del dispositivo.
(function (root) {
  const KEY = 'nihongo-diario-v1';
  const VERSION = 5;
  const DAY_START_H = 4; // el día de estudio cambia a las 4:00, no a medianoche

  const defaults = () => ({
    v: VERSION,
    settings: { romaji: true, perDay: 5, rate: 0.85, theme: 'auto', fun: true, adult: true, reviewMode: 'mix', retention: 0.9 },
    srs: {},          // id -> { added, r: estado FSRS (reconocer), p: estado FSRS | null (producir) }
    daily: null,      // { day, ids:[], step:'review'|'learn'|'quiz'|'done' }
    streak: { count: 0, last: null, best: 0 },
    kana: {},         // 'h:あ' -> { c, w, s }
    log: {},          // day -> { learned, reviews, ok, fail }
    nums: {},         // tema de números -> { h: últimos 20 aciertos (1/0) }
    dayOffset: 0,     // solo para pruebas
  });

  let state;
  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const d = defaults();
      state = parsed ? { ...d, ...parsed, v: parsed.v || 1, settings: { ...d.settings, ...(parsed.settings || {}) } } : d;
    } catch (e) {
      state = defaults();
    }
    if (migrate(state)) { state.updatedAt = Date.now(); write(); } // la versión migrada pasa a ser la más reciente
    return state;
  }
  function write() {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin espacio / modo privado */ }
  }
  function save() {
    state.updatedAt = Date.now();
    write();
    if (root.Sync) root.Sync.schedule();
  }
  // Sustituir el estado entero (al bajar de la nube) sin marcarlo como cambio local
  function replace(obj) {
    const d = defaults();
    state = { ...d, ...obj, v: obj.v || 1, settings: { ...d.settings, ...(obj.settings || {}) } };
    if (migrate(state)) state.updatedAt = Date.now();
    write();
  }

  // Sin migraciones: un formato anterior a FSRS (v < 3) empieza de cero, y en cada carga se borra
  // el progreso de las frases que ya no existen en data/content.js.
  const REVIEW_MODES = ['mix', 'r', 'p', 'audio'];
  function migrate(st) {
    const from = st.v || 1;
    let changed = false;
    if (from < VERSION) {
      if (from < 3) { st.srs = {}; st.kana = {}; }
      if (from < 4) st.nums = {};
      delete st.migrated; st.daily = null; st.v = VERSION;
      changed = true;
    }
    st.settings = st.settings || {};
    if (!REVIEW_MODES.includes(st.settings.reviewMode)) { st.settings.reviewMode = 'mix'; changed = true; }
    return prune(st) || changed;
  }
  function prune(st) {
    if (!root.ITEMS_LIST) return false;
    const ids = new Set(root.ITEMS_LIST.map((i) => i.id));
    let n = 0;
    Object.keys(st.srs || {}).forEach((id) => { if (!ids.has(id)) { delete st.srs[id]; n++; } });
    return n > 0;
  }

  // Número de día local (cambia a las 4:00 en tu zona horaria)
  function today() {
    const d = new Date(Date.now() - DAY_START_H * 3600000);
    const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(local / 86400000) + (state ? state.dayOffset || 0 : 0);
  }

  function logDay(field, n = 1) {
    const t = today();
    const l = (state.log[t] = state.log[t] || { learned: 0, reviews: 0 });
    l[field] = (l[field] || 0) + n;
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

  root.Store = {
    load, save, replace, write, today, logDay, exportJSON, importJSON, reset, migrate,
    get s() { return state; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
