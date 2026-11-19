// FSRS-6 (Free Spaced Repetition Scheduler), versión por días.
// Fórmulas y pesos por defecto: github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
// Estado de una tarjeta: { s: estabilidad (días), d: dificultad (1-10), last: día del último repaso,
//                          due: día del próximo, reps, lapses }  ·  s === null → nunca evaluada.
// Notas FSRS: 1 = Otra vez, 2 = Difícil, 3 = Bien, 4 = Fácil.
(function (root) {
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
    1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const DECAY = -W[20];
  const FACTOR = Math.pow(0.9, 1 / DECAY) - 1; // hace que R(S, S) = 90 %
  const MAX_IVL = 3650;
  const S_MIN = 0.01;

  const clampD = (d) => Math.min(10, Math.max(1, d));
  const initS = (G) => Math.max(S_MIN, W[G - 1]);
  const initD = (G) => clampD(W[4] - Math.exp(W[5] * (G - 1)) + 1);

  // Probabilidad de recordar tras t días con estabilidad S
  function retrievability(t, S) { return Math.pow(1 + FACTOR * Math.max(0, t) / S, DECAY); }
  // Días hasta que la probabilidad de recordar baja a `retention`
  function interval(S, retention = 0.9) {
    const ivl = (S / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
    return Math.min(MAX_IVL, Math.max(1, Math.round(ivl)));
  }

  function nextD(D, G) {
    const dp = D + -W[6] * (G - 3) * ((10 - D) / 9); // amortiguación lineal
    return clampD(W[7] * initD(4) + (1 - W[7]) * dp); // reversión a la media
  }
  function recallS(D, S, R, G) {
    const hard = G === 2 ? W[15] : 1, easy = G === 4 ? W[16] : 1;
    return S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * hard * easy);
  }
  function forgetS(D, S, R) {
    const sf = W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R));
    return Math.min(sf, S / Math.exp(W[17] * W[18]));
  }
  function shortTermS(S, G) { // repaso el mismo día
    let inc = Math.exp(W[17] * (G - 3 + W[18])) * Math.pow(S, -W[19]);
    if (G >= 3) inc = Math.max(1, inc);
    return S * inc;
  }

  // Nuevo estado tras evaluar con nota G el día `today` (sin fuzz)
  function step(card, G, today, retention) {
    const c = { reps: 0, lapses: 0, ...card };
    if (c.s == null || c.d == null) {
      c.s = initS(G); c.d = initD(G);
    } else {
      const elapsed = c.last == null ? 0 : today - c.last;
      if (elapsed <= 0) c.s = shortTermS(c.s, G);
      else {
        const R = retrievability(elapsed, c.s);
        c.s = G === 1 ? forgetS(c.d, c.s, R) : recallS(c.d, c.s, R, G);
      }
      if (G === 1 && elapsed > 0) c.lapses += 1;
      c.d = nextD(c.d, G);
    }
    c.s = +Math.max(S_MIN, c.s).toFixed(4); c.d = +c.d.toFixed(4); // números cortos para la nube
    c.reps += 1; c.last = today;
    c.ivl = interval(c.s, retention);
    return c;
  }

  // Las 4 opciones (Otra vez, Difícil, Bien, Fácil) con intervalos ordenados: difícil ≤ bien < fácil
  function options(card, today, retention = 0.9) {
    const o = [1, 2, 3, 4].map((G) => step(card, G, today, retention));
    o[0].ivl = 1;
    o[1].ivl = Math.min(o[1].ivl, o[2].ivl);
    o[2].ivl = Math.max(o[2].ivl, o[1].ivl + (card.s == null ? 0 : 1));
    o[3].ivl = Math.max(o[3].ivl, o[2].ivl + 1);
    return o;
  }

  // Variación aleatoria pequeña para que los repasos no se amontonen el mismo día
  function fuzz(ivl, rnd = Math.random) {
    if (ivl < 3) return ivl;
    const delta = Math.max(1, Math.round(ivl * 0.05));
    return Math.min(MAX_IVL, Math.max(2, ivl + Math.round((rnd() * 2 - 1) * delta)));
  }

  root.FSRS = { W, retrievability, interval, options, fuzz, initS, initD, step };
})(typeof window !== 'undefined' ? window : globalThis);
