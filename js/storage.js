// Progreso guardado en localStorage del dispositivo.
(function (root) {
  const KEY = 'nihongo-diario-v1';
  const VERSION = 4;
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

  function migrate(st) {
    const from = st.v || 1;
    if (from >= VERSION) return false;
    if (from < 2) migrateV1(st);
    if (from < 3) migrateV2(st);
    if (from < 4) migrateV4(st);
    st.v = VERSION;
    return true;
  }

  // v1 → v2: el contenido pasó de ids por posición (v12, p-basicas-3) a ids por texto japonés.
  // Se conservan las tarjetas que siguen existiendo; las palabras eliminadas se borran.
  function migrateV1(st) {
    const map = root.LEGACY_MAP || {};
    const srs = {}; let kept = 0, dropped = 0;
    Object.entries(st.srs || {}).forEach(([id, c]) => {
      const n = map[id];
      if (!n) { dropped++; return; }
      if (!srs[n]) { kept++; srs[n] = c; } else if ((c.ivl || 0) > (srs[n].ivl || 0)) srs[n] = c;
    });
    st.srs = srs; st.daily = null; st.nums = st.nums || {};
    if (st.settings) delete st.settings.focus;
    if (kept || dropped) st.migrated = { kept, dropped, seen: false };
  }

  // v2 → v3: SM-2 (ivl, ease) → FSRS con memorias separadas de reconocer y producir.
  // Estabilidad ≈ intervalo; dificultad según la facilidad (ease 2.5 → 5, 1.3 → 9).
  // Producir arranca con la mitad de estabilidad y repartida en los próximos días para no acumular.
  function migrateV2(st) {
    const t = today();
    const srs = {};
    Object.entries(st.srs || {}).forEach(([id, c], i) => {
      if (!c || c.r !== undefined) { srs[id] = c; return; } // ya es v3
      const ivl = Math.max(0, c.ivl || 0);
      const d = Math.min(10, Math.max(1, 5 + (2.5 - (c.ease || 2.5)) * 3.33));
      const evaluated = (c.reps || 0) > 0 || ivl > 0 || c.last != null;
      const r = {
        s: evaluated ? Math.max(0.5, ivl) : null, d: evaluated ? +d.toFixed(4) : null,
        due: c.due ?? t, last: evaluated ? (c.last ?? (c.due != null ? c.due - Math.max(1, ivl) : t)) : null,
        reps: c.reps || 0, lapses: c.lapses || 0, ivl,
      };
      let p = null;
      if (r.s != null && r.s >= 3) {
        const ps = Math.max(1, ivl / 2);
        p = { s: ps, d: +Math.min(10, d + 1).toFixed(4), last: t, due: t + 1 + (i % Math.max(1, Math.round(ps))), reps: 1, lapses: 0, ivl: Math.round(ps) };
      }
      srs[id] = { added: c.added ?? t, r, p };
    });
    st.srs = srs;
    // Kana: de "3 aciertos seguidos" a memoria FSRS. Los ya dominados conservan su nivel (7 días).
    Object.values(st.kana || {}).forEach((k) => {
      if (!k || k.f || !((k.c || 0) + (k.w || 0))) return;
      const done = (k.s || 0) >= 3;
      k.f = { s: done ? 7 : 1, d: done ? 4 : 6, last: t, due: t + (done ? 7 : 1), reps: k.c || 0, lapses: k.w || 0, ivl: done ? 7 : 1 };
    });
    st.settings = st.settings || {};
    st.settings.reviewMode = { jp: 'r', es: 'p' }[st.settings.reviewMode] || st.settings.reviewMode || 'mix';
    if (st.daily && st.daily.step === 'review') st.daily.step = 'learn';
  }

  // v3 → v4: las plantillas con 〜 y las palabras sueltas pasan a frases completas (data/renamed.js).
  // El progreso se mueve al id nuevo con la estabilidad limitada a 3 días, para que vuelva pronto como test.
  // Si el destino ya tenía progreso, se queda el más fuerte. Lo que ya no existe en el contenido se borra.
  const V4_CAP_S = 3;
  function migrateV4(st) {
    const map = root.RENAMED || {};
    const exists = root.ITEMS_LIST ? new Set(root.ITEMS_LIST.map((i) => i.id)) : null;
    const t = today();
    const cap = (c) => {
      if (!c || c.s == null) return c ? { ...c } : c;
      const s = Math.min(c.s, V4_CAP_S);
      return { ...c, s, due: Math.min(c.due, t + Math.max(1, Math.round(s))) };
    };
    const strength = (e) => (e && e.r && e.r.s) || 0;
    const srs = {}; let moved = 0, dropped = 0;
    Object.entries(st.srs || {}).forEach(([id, e]) => { if (!map[id]) srs[id] = e; });
    Object.entries(st.srs || {}).forEach(([id, e]) => {
      const to = map[id]; if (!to || !e) return;
      const ne = { ...e, r: cap(e.r), p: cap(e.p) || null };
      if (!srs[to] || strength(ne) > strength(srs[to])) srs[to] = ne;
      moved++;
    });
    if (exists) Object.keys(srs).forEach((id) => { if (!exists.has(id)) { delete srs[id]; dropped++; } });
    st.srs = srs;
    st.nums = {}; // las estadísticas de números pasan a ser por tema
    if (moved || dropped) st.migrated = { v: 4, moved, dropped, seen: false };
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
