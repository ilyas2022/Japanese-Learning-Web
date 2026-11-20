// Utilidades puras de los tests: barajas sin repetir, nota automática, distractores claros y acierto reciente.
(function (root) {
  function shuffle(a, rnd = Math.random) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Baraja sin reposición: no repite nada hasta haber sacado todo, y al rebarajar no empieza por el último que salió.
  //   next()  → un elemento
  //   take(n) → n elementos distintos (como mucho, todos)
  function makeDeck(items, opts = {}) {
    const rnd = opts.rnd || Math.random;
    const key = opts.key || ((x) => x);
    let pile = [], last;
    function refill() {
      pile = shuffle(items, rnd);
      if (pile.length > 1 && last !== undefined && key(pile[0]) === key(last)) {
        const j = 1 + Math.floor(rnd() * (pile.length - 1));
        [pile[0], pile[j]] = [pile[j], pile[0]];
      }
    }
    function next() {
      if (!items.length) return undefined;
      if (!pile.length) refill();
      last = pile.shift();
      return last;
    }
    function take(n) {
      const want = Math.min(n, new Set(items.map(key)).size);
      const out = [], seen = new Set();
      let guard = 0;
      while (out.length < want && guard++ < want * 4 + items.length + 10) {
        if (!pile.length) refill();
        const x = pile.shift(); const k = key(x);
        if (seen.has(k)) { pile.push(x); continue; }
        seen.add(k); out.push(x); last = x;
      }
      return out;
    }
    return { next, take, get left() { return pile.length; } };
  }

  // n valores distintos de un generador aleatorio (para rangos enormes como 1-9.999)
  function uniqueDraw(gen, n, key = (x) => x) {
    const out = [], seen = new Set();
    let guard = 0;
    while (out.length < n && guard++ < n * 30) {
      const x = gen(); const k = key(x);
      if (!seen.has(k)) { seen.add(k); out.push(x); }
    }
    return out;
  }

  // Nota FSRS a partir de la respuesta (0 = Otra vez, 1 = Difícil, 2 = Bien, 3 = Fácil).
  //   type: 'meaning' | 'reverse' | 'listen' (opción múltiple) · 'build' · 'write'
  //   near: al escribir, "casi" (vocal larga, っ o una letra) · override: "mi respuesta también vale"
  const MC_SLOW_MS = 8000;
  function autoGrade({ type, ok, near, override, ms, len = 0 }) {
    if (override) return 2;
    if (!ok) return near ? 1 : 0;
    if (type === 'write') return ms != null && ms < 4000 + 250 * len ? 3 : 2;
    if (type === 'build') return 2;
    return ms != null && ms > MC_SLOW_MS ? 1 : 2;
  }

  // ¿Dos frases se parecen tanto que como opciones serían ambiguas?
  // (ありがとう / ありがとうございます, o el mismo significado en español)
  const jpCore = (s) => String(s || '').replace(/[\s、。！？!?…〜~・「」()（）.,]/g, '');
  const esParts = (s) => String(s || '').toLowerCase()
    .replace(/\([^)]*\)/g, ' ').replace(/[¡!¿?.,"«»…]/g, ' ')
    .split('/').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  function similar(a, b) {
    const ja = jpCore(a.kana || a.jp), jb = jpCore(b.kana || b.jp);
    if (ja && jb && (ja === jb || (Math.min(ja.length, jb.length) >= 2 && (ja.includes(jb) || jb.includes(ja))))) return true;
    // same meaning, or one starts like the other ("otra vez" / "otra vez, por favor")
    const ea = esParts(a.es), eb = esParts(b.es);
    return ea.some((x) => eb.some((y) => x === y || x.startsWith(y + ' ') || y.startsWith(x + ' ')));
  }

  // Historial de aciertos recientes (1/0), como mucho n
  function rolling(hist, ok, n = 20) { return [...(hist || []), ok ? 1 : 0].slice(-n); }
  function pct(hist) { return hist && hist.length ? Math.round((hist.reduce((a, x) => a + x, 0) / hist.length) * 100) : null; }

  root.Quiz = { shuffle, makeDeck, uniqueDraw, autoGrade, similar, rolling, pct, MC_SLOW_MS };
})(typeof window !== 'undefined' ? window : globalThis);
