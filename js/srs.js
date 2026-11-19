// Repetición espaciada con FSRS (js/fsrs.js).
// Cada frase guarda dos memorias separadas, porque reconocer y producir son conocimientos distintos:
//   srs[id] = { added, r: estado (reconocer: JP/oído → ES), p: estado | null (producir: ES → JP) }
// "Producir" se desbloquea cuando reconocer alcanza una estabilidad de 3 días.
// Las tarjetas se identifican con una clave 'id|r' o 'id|p'.
// Notas de la app: 0 = Otra vez, 1 = Difícil, 2 = Bien, 3 = Fácil (FSRS usa 1-4).
(function (root) {
  const UNLOCK_P = 3;  // días de estabilidad en reconocer para empezar a producir
  const SIDES = ['r', 'p'];

  const S = () => root.Store.s;
  const today = () => root.Store.today();
  const retention = () => (S().settings && S().settings.retention) || 0.9;

  const key = (id, side) => id + '|' + side;
  function parse(k) { const i = k.lastIndexOf('|'); return { id: k.slice(0, i), side: k.slice(i + 1) }; }
  function state(k) { const { id, side } = parse(k); const e = S().srs[id]; return (e && e[side]) || null; }

  const fresh = (due) => ({ s: null, d: null, due, last: null, reps: 0, lapses: 0 });

  // Añadir una frase al repaso. dueInDays = 1 → viene del reto de Hoy (ya aprendida y testeada hoy).
  function addItem(id, dueInDays = 1) {
    const s = S();
    if (s.srs[id]) return false;
    const t = today();
    let r;
    if (dueInDays > 0) {
      r = root.FSRS.step(fresh(t), 3, t, retention()); // como un primer "Bien"
      r.due = t + dueInDays;
    } else r = fresh(t);
    s.srs[id] = { added: t, r, p: null };
    return true;
  }

  function preview(k, g) {
    const c = state(k) || fresh(today());
    return root.FSRS.options(c, today(), retention())[g];
  }

  function unlockProduction(id) {
    const e = S().srs[id];
    if (e && !e.p && e.r && e.r.s != null && e.r.s >= UNLOCK_P) { e.p = fresh(today() + 1); return true; }
    return false;
  }

  function grade(k, g) {
    const { id, side } = parse(k);
    const e = S().srs[id]; if (!e || !e[side]) return null;
    const t = today();
    const c = root.FSRS.options(e[side], t, retention())[g];
    c.ivl = root.FSRS.fuzz(c.ivl);
    c.due = t + c.ivl;
    e[side] = c;
    if (side === 'r') unlockProduction(id);
    root.Store.logDay('reviews');
    root.Store.logDay(g === 0 ? 'fail' : 'ok');
    return c;
  }

  // Fallo fuera del repaso programado (práctica libre, construir): cuenta como "Otra vez".
  // Si se pasa un id sin lado, usa producir si existe; si no, reconocer.
  function miss(k) {
    if (!k.includes('|')) k = key(k, S().srs[k] && S().srs[k].p ? 'p' : 'r');
    const { id, side } = parse(k);
    const e = S().srs[id]; if (!e) return;
    grade(e[side] ? k : key(id, 'r'), 0);
  }

  // Orden estable pero mezclado dentro del mismo día (intercalar unidades)
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // Claves pendientes hoy. side: 'r' | 'p' | undefined (todas)
  function due(side) {
    const t = today(); const out = [];
    Object.entries(S().srs).forEach(([id, e]) => SIDES.forEach((sd) => {
      if ((!side || side === sd) && e[sd] && e[sd].due <= t) out.push({ k: key(id, sd), due: e[sd].due });
    }));
    return out.sort((a, b) => a.due - b.due || hash(a.k + t) - hash(b.k + t)).map((x) => x.k);
  }

  function label(days) {
    if (days <= 0) return 'hoy';
    if (days === 1) return '1 día';
    if (days < 30) return days + ' días';
    if (days < 365) return Math.round(days / 30) + ' mes' + (Math.round(days / 30) > 1 ? 'es' : '');
    return (days / 365).toFixed(1) + ' años';
  }

  // Nivel de dominio de un estado (por estabilidad)
  function level(c) {
    if (!c || c.s == null) return 'nuevo';
    if (c.s >= 21) return 'dominada';
    if (c.s >= 7) return 'madura';
    return 'aprendiendo';
  }

  // Resumen de una frase: el nivel lo marca la memoria más débil (producir aún bloqueado = como mucho "aprendiendo")
  function item(id) {
    const e = S().srs[id]; if (!e) return null;
    const sts = SIDES.map((sd) => e[sd]).filter(Boolean);
    const minS = Math.min(...sts.map((c) => (c.s == null ? 0 : c.s)));
    const lapses = sts.reduce((a, c) => a + (c.lapses || 0), 0);
    return {
      due: Math.min(...sts.map((c) => c.due)),
      level: e.p ? level({ s: minS }) : (level(e.r) === 'nuevo' ? 'nuevo' : 'aprendiendo'),
      lapses, hard: lapses >= 3, s: minS, hasP: !!e.p, added: e.added,
    };
  }
  const isHard = (id) => { const i = item(id); return !!(i && i.hard); };

  // Probabilidad actual de recordar (0-1) de una tarjeta
  function recall(k) {
    const c = state(k); if (!c || c.s == null || c.last == null) return 0;
    return root.FSRS.retrievability(today() - c.last, c.s);
  }

  // Las más débiles primero: más fallos y menor probabilidad de recordar
  function weakest() {
    return Object.keys(S().srs)
      .map((id) => ({ id, i: item(id), R: Math.min(...SIDES.filter((sd) => S().srs[id][sd]).map((sd) => recall(key(id, sd)))) }))
      .sort((a, b) => b.i.lapses - a.i.lapses || a.R - b.R)
      .map((x) => x.id);
  }
  function recent(days) {
    const t = today();
    return Object.entries(S().srs).filter(([, e]) => (e.added ?? t) >= t - days).map(([id]) => id);
  }

  root.SRS = { key, parse, state, addItem, preview, grade, due, label, level, item, miss, weakest, recent, isHard, recall, unlockProduction, UNLOCK_P };
})(typeof window !== 'undefined' ? window : globalThis);
