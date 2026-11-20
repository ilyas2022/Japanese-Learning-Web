// Números japoneses: lectura (kana + romaji), kanji y contadores con sus irregularidades.
(function () {
  const D = [['ゼロ', 'zero'], ['いち', 'ichi'], ['に', 'ni'], ['さん', 'san'], ['よん', 'yon'], ['ご', 'go'], ['ろく', 'roku'], ['なな', 'nana'], ['はち', 'hachi'], ['きゅう', 'kyuu']];
  const K = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const TH = { 1: ['せん', 'sen'], 3: ['さんぜん', 'sanzen'], 8: ['はっせん', 'hassen'] };
  const HU = { 1: ['ひゃく', 'hyaku'], 3: ['さんびゃく', 'sanbyaku'], 6: ['ろっぴゃく', 'roppyaku'], 8: ['はっぴゃく', 'happyaku'] };

  // Partes de un número de 1 a 9999. beforeMan: 1000 delante de 万 se dice いっせん.
  function chunk(n, beforeMan) {
    const p = [];
    const th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10;
    if (th) p.push(th === 1 && beforeMan ? ['いっせん', 'issen'] : TH[th] || [D[th][0] + 'せん', D[th][1] + 'sen']);
    if (h) p.push(HU[h] || [D[h][0] + 'ひゃく', D[h][1] + 'hyaku']);
    if (t) p.push(t === 1 ? ['じゅう', 'juu'] : [D[t][0] + 'じゅう', D[t][1] + 'juu']);
    if (o) p.push(D[o]);
    return p;
  }
  function parts(n) {
    if (n === 0) return [];
    const oku = Math.floor(n / 1e8), man = Math.floor(n / 1e4) % 1e4, rest = n % 1e4;
    const p = [];
    if (oku) p.push(...chunk(oku, true), ['おく', 'oku']);
    if (man) p.push(...chunk(man, true), ['まん', 'man']);
    if (rest) p.push(...chunk(rest, false));
    return p;
  }
  const join = (p) => ({ kana: p.map((x) => x[0]).join(''), romaji: p.map((x) => x[1]).join(' ').replace(/ (man|oku)\b/g, '$1') });
  function toJa(n) { return n === 0 ? { kana: 'ゼロ', romaji: 'zero' } : join(parts(n)); }

  function kanjiChunk(n) {
    let s = '';
    const th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, o = n % 10;
    if (th) s += (th > 1 ? K[th] : '') + '千';
    if (h) s += (h > 1 ? K[h] : '') + '百';
    if (t) s += (t > 1 ? K[t] : '') + '十';
    if (o) s += K[o];
    return s;
  }
  function toKanji(n) {
    if (n === 0) return '〇';
    const oku = Math.floor(n / 1e8), man = Math.floor(n / 1e4) % 1e4, rest = n % 1e4;
    return (oku ? kanjiChunk(oku) + '億' : '') + (man ? kanjiChunk(man) + '万' : '') + (rest ? kanjiChunk(rest) : '');
  }
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Une la "cabeza" (n sin las unidades) con un final especial.
  function head(n) { return n ? parts(n) : []; }
  function withEnd(n, unitsDigit, end) { // el contador va pegado: "juu niji", no "juu ni ji"
    const h = join(head(n - unitsDigit));
    return { kana: h.kana + end[0], romaji: h.romaji + (h.romaji && unitsDigit ? ' ' : '') + end[1] };
  }

  const COUNTERS = {
    tsu: {
      name: 'Cosas (〜つ)', unit: 'cosas', kanji: 'つ', max: 10, hint: 'Para pedir cosas sin saber su contador: 一つください = uno, por favor. Solo del 1 al 10; a partir de 11 se usa el número normal.',
      read(n) {
        const T = [null, ['ひとつ', 'hitotsu'], ['ふたつ', 'futatsu'], ['みっつ', 'mittsu'], ['よっつ', 'yottsu'], ['いつつ', 'itsutsu'], ['むっつ', 'muttsu'], ['ななつ', 'nanatsu'], ['やっつ', 'yattsu'], ['ここのつ', 'kokonotsu'], ['とお', 'too']];
        return { kana: T[n][0], romaji: T[n][1] };
      },
      jp: (n) => K[n] + 'つ', es: (n) => `${n} cosa${n > 1 ? 's' : ''}`,
    },
    nin: {
      name: 'Personas (〜人)', unit: 'personas', kanji: '人', max: 10, hint: '1 y 2 son irregulares: ひとり, ふたり. 4 = よにん.',
      read(n) {
        if (n === 1) return { kana: 'ひとり', romaji: 'hitori' };
        if (n === 2) return { kana: 'ふたり', romaji: 'futari' };
        if (n % 10 === 4) return withEnd(n, 4, ['よにん', 'yonin']);
        return withEnd(n, 0, ['にん', 'nin']);
      },
      jp: (n) => toKanji(n) + '人', es: (n) => `${n} persona${n > 1 ? 's' : ''}`,
    },
    en: {
      name: 'Yenes (〜円)', unit: 'yenes', kanji: '円', max: 99999, hint: 'Se escribe 円 pero se dice "en". Ojo: 4円 = よえん.',
      read(n) { return n % 10 === 4 ? withEnd(n, 4, ['よえん', 'yoen']) : withEnd(n, 0, ['えん', 'en']); },
      jp: (n) => '¥' + fmt(n).replace(/\./g, ','), es: (n) => `${fmt(n)} yenes`,
    },
    ji: {
      name: 'Horas (〜時)', unit: 'en punto', kanji: '時', max: 12, hint: 'Irregulares: 4時 よじ · 7時 しちじ · 9時 くじ. Y media = 半 (han).',
      read(n) {
        const T = { 4: ['よじ', 'yoji'], 7: ['しちじ', 'shichiji'], 9: ['くじ', 'kuji'] };
        return T[n % 10] && n !== 14 ? withEnd(n, n % 10, T[n % 10]) : withEnd(n, 0, ['じ', 'ji']);
      },
      jp: (n) => toKanji(n) + '時', es: (n) => (n === 1 ? 'la 1' : `las ${n}`),
    },
    fun: {
      name: 'Minutos (〜分)', unit: 'minutos', kanji: '分', max: 59, hint: 'Cambia según el número: いっぷん, にふん, さんぷん, よんぷん, ごふん, ろっぷん, ななふん, はっぷん, きゅうふん, じゅっぷん.',
      read(n) {
        const O = { 1: ['いっぷん', 'ippun'], 2: ['にふん', 'nifun'], 3: ['さんぷん', 'sanpun'], 4: ['よんぷん', 'yonpun'], 5: ['ごふん', 'gofun'], 6: ['ろっぷん', 'roppun'], 7: ['ななふん', 'nanafun'], 8: ['はっぷん', 'happun'], 9: ['きゅうふん', 'kyuufun'] };
        const o = n % 10, t = Math.floor(n / 10);
        if (o === 0) return withEnd(n, n, t > 1 ? [D[t][0] + 'じゅっぷん', D[t][1] + 'juppun'] : ['じゅっぷん', 'juppun']);
        return withEnd(n, o, O[o]);
      },
      jp: (n) => toKanji(n) + '分', es: (n) => `${n} minuto${n > 1 ? 's' : ''}`,
    },
    sai: {
      name: 'Edad (〜歳)', unit: 'años', kanji: '歳', max: 99, hint: '20 años = はたち (especial). Terminados en 1, 8 y 0 cambian: いっさい, はっさい, じゅっさい.',
      read(n) {
        if (n === 20) return { kana: 'はたち', romaji: 'hatachi' };
        const o = n % 10, t = Math.floor(n / 10);
        if (o === 1) return withEnd(n, 1, ['いっさい', 'issai']);
        if (o === 8) return withEnd(n, 8, ['はっさい', 'hassai']);
        if (o === 0) return withEnd(n, n, t > 1 ? [D[t][0] + 'じゅっさい', D[t][1] + 'jussai'] : ['じゅっさい', 'jussai']);
        return withEnd(n, 0, ['さい', 'sai']);
      },
      jp: (n) => (n === 20 ? '二十歳' : toKanji(n) + '歳'), es: (n) => `${n} años`,
    },
    kai: {
      name: 'Veces (〜回)', unit: 'veces', kanji: '回', max: 10, hint: 'もう一回 = una vez más. Cambian 1, 6, 8 y 10: いっかい, ろっかい, はっかい, じゅっかい.',
      read(n) {
        const T = { 1: ['いっかい', 'ikkai'], 6: ['ろっかい', 'rokkai'], 8: ['はっかい', 'hakkai'] };
        if (n === 10) return { kana: 'じゅっかい', romaji: 'jukkai' };
        return T[n] ? { kana: T[n][0], romaji: T[n][1] } : withEnd(n, 0, ['かい', 'kai']);
      },
      jp: (n) => toKanji(n) + '回', es: (n) => `${n} ${n > 1 ? 'veces' : 'vez'}`,
    },
    gatsu: {
      name: 'Meses (〜月)', unit: 'mes', kanji: '月', max: 12, hint: 'Mes = número + がつ. Ojo: 4月 しがつ · 7月 しちがつ · 9月 くがつ.',
      read(n) {
        const T = { 4: ['しがつ', 'shigatsu'], 7: ['しちがつ', 'shichigatsu'], 9: ['くがつ', 'kugatsu'] };
        return T[n] ? { kana: T[n][0], romaji: T[n][1] } : withEnd(n, 0, ['がつ', 'gatsu']);
      },
      jp: (n) => toKanji(n) + '月', es: (n) => ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][n],
    },
    nichi: {
      name: 'Días del mes (〜日)', unit: 'día', kanji: '日', max: 31, hint: 'Del 1 al 10 tienen nombre propio (ついたち, ふつか, みっか…). También 14 じゅうよっか, 20 はつか y 24 にじゅうよっか. El resto: número + にち (17 じゅうしちにち, 19 じゅうくにち).',
      read(n) {
        const T = { 1: ['ついたち', 'tsuitachi'], 2: ['ふつか', 'futsuka'], 3: ['みっか', 'mikka'], 4: ['よっか', 'yokka'], 5: ['いつか', 'itsuka'], 6: ['むいか', 'muika'], 7: ['なのか', 'nanoka'], 8: ['ようか', 'youka'], 9: ['ここのか', 'kokonoka'], 10: ['とおか', 'tooka'], 20: ['はつか', 'hatsuka'] };
        if (T[n]) return { kana: T[n][0], romaji: T[n][1] };
        const o = n % 10;
        if (o === 4) return withEnd(n, 4, ['よっか', 'yokka']);
        if (o === 7) return withEnd(n, 7, ['しちにち', 'shichinichi']);
        if (o === 9) return withEnd(n, 9, ['くにち', 'kunichi']);
        return withEnd(n, 0, ['にち', 'nichi']);
      },
      jp: (n) => toKanji(n) + '日', es: (n) => `día ${n}`,
    },
  };

  function time(h, m) {
    const hr = COUNTERS.ji.read(h);
    if (m === 0) return hr;
    if (m === 30) return { kana: hr.kana + 'はん', romaji: hr.romaji + ' han' };
    const mi = COUNTERS.fun.read(m);
    return { kana: hr.kana + mi.kana, romaji: hr.romaji + ' ' + mi.romaji };
  }

  const WEEKDAYS = [
    ['月曜日', 'げつようび', 'getsuyoubi', 'lunes', 'luna'], ['火曜日', 'かようび', 'kayoubi', 'martes', 'fuego'],
    ['水曜日', 'すいようび', 'suiyoubi', 'miércoles', 'agua'], ['木曜日', 'もくようび', 'mokuyoubi', 'jueves', 'árbol'],
    ['金曜日', 'きんようび', 'kin\'youbi', 'viernes', 'oro'], ['土曜日', 'どようび', 'doyoubi', 'sábado', 'tierra'],
    ['日曜日', 'にちようび', 'nichiyoubi', 'domingo', 'sol'],
  ];

  // ---------- temas de práctica ----------
  // Cada tema: items() (conjunto cerrado) o gen() (aleatorio), read(v) → { kana, romaji }, show(v) (lo que ves),
  // sub(v) (línea pequeña), keypad (al oírlo se responde con el teclado numérico; si no, con opciones),
  // num(v) (número que hay que teclear), trap(v) (la forma "regular" que no existe) y alts(v) (otras lecturas válidas).
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickR = (a) => a[Math.floor(Math.random() * a.length)];
  const shuf = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = (m) => String(m).padStart(2, '0');
  const naive = (suffix) => (n) => { const t = toJa(n); return { kana: t.kana + suffix[0], romaji: t.romaji + suffix[1] }; };

  const PRICES = [98, 100, 108, 120, 150, 180, 198, 220, 248, 298, 330, 398, 440, 480, 550, 600, 680, 780, 850, 980, 1080, 1280, 1500, 1680, 1980, 2400, 2980, 3500, 3800, 4500, 5800, 6400, 8800, 9800, 12800, 15000, 24800, 39800];
  const ALTS = { 0: [['れい', 'rei']], 4: [['し', 'shi']], 7: [['しち', 'shichi']], 9: [['く', 'ku']] };

  // Números parecidos (cambiar una cifra, intercambiar dos, ×10, ±…) para las opciones
  function nearNumbers(n, count = 6) {
    const out = new Set(); const s = String(n); let guard = 0;
    while (out.size < count && guard++ < 300) {
      let m; const r = Math.random();
      if (r < 0.45) { const i = rnd(0, s.length - 1); const d = rnd(i === 0 ? 1 : 0, 9); m = +(s.slice(0, i) + d + s.slice(i + 1)); }
      else if (r < 0.6 && s.length > 1) { const i = rnd(0, s.length - 2); m = +(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)); }
      else if (r < 0.75) m = Math.random() < 0.5 ? n * 10 : Math.floor(n / 10);
      else m = n + pickR([-1, 1, -10, 10, -100, 100, 4, -4, 3]) * Math.max(1, 10 ** Math.max(0, s.length - 2));
      if (m > 0 && m !== n && m < 1e9) out.add(m);
    }
    return [...out];
  }
  const hm = (v) => [Math.floor(v / 100), v % 100];
  const W = WEEKDAYS;

  const C = COUNTERS;
  const ctr = (k, o = {}) => ({ read: (n) => C[k].read(n), show: (n) => C[k].es(n), sub: (n) => C[k].jp(n), ...o });
  const base = (o) => ({ read: toJa, show: fmt, sub: (n) => toKanji(n), ...o });
  const TOPICS = [
    base({ id: 'd10', group: 'base', name: '0 – 10', items: () => range(0, 10), alts: (n) => (ALTS[n] || []).map(([kana, romaji]) => ({ kana, romaji })) }),
    base({ id: 'd99', group: 'base', name: '11 – 99', items: () => range(11, 99) }),
    base({ id: 'd999', group: 'base', name: '100 – 999', gen: () => (Math.random() < 0.35 ? rnd(1, 9) * 100 : rnd(100, 999)) }),
    base({ id: 'd9999', group: 'base', name: '1.000 – 9.999', gen: () => { const r = Math.random(); return r < 0.3 ? rnd(1, 9) * 1000 : r < 0.55 ? rnd(10, 99) * 100 : rnd(1000, 9999); } }),
    base({ id: 'man', group: 'base', name: '万 · 10.000+', gen: () => pickR([() => rnd(1, 9) * 10000, () => rnd(10, 99) * 10000, () => rnd(1, 9) * 100000, () => rnd(1, 9) * 1000000, () => rnd(10000, 99999), () => rnd(1, 9) * 10000000])() }),
    ctr('en', { id: 'precios', group: 'dia', name: 'Precios ¥', gen: () => (Math.random() < 0.7 ? pickR(PRICES) : rnd(1, 99) * 10), show: (n) => C.en.jp(n), sub: () => '', trap: naive(['えん', 'en']) }),
    {
      id: 'horas', group: 'dia', name: 'Horas', keypad: false,
      gen: () => rnd(1, 12) * 100 + pickR([0, 0, 30, 30, 15, 45, 10, 20, 40, 50, 5, rnd(1, 59)]),
      read: (v) => time(...hm(v)), show: (v) => { const [h, m] = hm(v); return `${h}:${pad(m)}`; }, sub: () => '',
      trap: (v) => {
        const [h, m] = hm(v); const right = time(h, m);
        if ([4, 7, 9].includes(h)) { const t = naive(['じ', 'ji'])(h); return { kana: right.kana.replace(C.ji.read(h).kana, t.kana), romaji: right.romaji.replace(C.ji.read(h).romaji, t.romaji) }; }
        if (m && m !== 30) { const f = naive(['ふん', 'fun'])(m); const mi = C.fun.read(m); return { kana: right.kana.replace(mi.kana, f.kana), romaji: right.romaji.replace(mi.romaji, f.romaji) }; }
        return null;
      },
      near: (v) => {
        const [h, m] = hm(v); const out = new Set();
        let guard = 0;
        while (out.size < 8 && guard++ < 100) {
          const hh = Math.random() < 0.6 ? pickR([4, 7, 9, rnd(1, 12)]) : h;
          const mm = Math.random() < 0.5 ? m : pickR([0, 30, 10, 20, 40, 1, 3, 6, 8]);
          if (hh * 100 + mm !== v) out.add(hh * 100 + mm);
        }
        return [...out];
      },
    },
    ctr('fun', { id: 'minutos', group: 'dia', name: 'Minutos 分', items: () => range(1, 60), trap: naive(['ふん', 'fun']) }),
    { id: 'youbi', group: 'dia', name: 'Días de la semana', keypad: false, items: () => range(0, 6), read: (v) => ({ kana: W[v][1], romaji: W[v][2] }), show: (v) => cap(W[v][3]), sub: (v) => W[v][0] },
    ctr('nichi', { id: 'nichi', group: 'dia', name: 'Días del mes 日', items: () => range(1, 31), trap: naive(['にち', 'nichi']) }),
    ctr('gatsu', { id: 'gatsu', group: 'dia', name: 'Meses 月', keypad: false, items: () => range(1, 12), show: (n) => cap(C.gatsu.es(n)), trap: naive(['がつ', 'gatsu']) }),
    ctr('nin', { id: 'nin', group: 'ctr', name: 'Personas 人', items: () => range(1, 10), trap: naive(['にん', 'nin']) }),
    ctr('tsu', { id: 'tsu', group: 'ctr', name: 'Cosas 〜つ', items: () => range(1, 10) }),
    ctr('sai', { id: 'sai', group: 'ctr', name: 'Edad 歳', items: () => range(1, 60), trap: naive(['さい', 'sai']) }),
    ctr('kai', { id: 'kai', group: 'ctr', name: 'Veces 回', items: () => range(1, 10), trap: naive(['かい', 'kai']) }),
  ].map((t) => ({ keypad: true, num: (v) => v, ...t }));
  const MIX = { id: 'mix', group: 'mix', name: 'Mezcla de todo' };
  const topic = (id) => TOPICS.find((t) => t.id === id) || null;

  const draw = (t) => (t.items ? pickR(t.items()) : t.gen());
  function nearValues(t, v) {
    if (t.near) return t.near(v);
    if (t.items) {
      const all = t.items().filter((x) => x !== v);
      const close = [...all].sort((a, b) => Math.abs(a - v) - Math.abs(b - v)).slice(0, 4);
      return [...close, ...shuf(all).slice(0, 4)];
    }
    return nearNumbers(v);
  }
  // Fills `out` with distinct entries until n (by key), from candidate values
  function fill(t, v, n, candidates, make, keyOf) {
    const out = [make(v)]; const seen = new Set([keyOf(out[0])]);
    const add = (x) => { if (out.length >= n || x === v || x == null) return; const o = make(x); const k = keyOf(o); if (k && !seen.has(k)) { seen.add(k); out.push(o); } };
    candidates.forEach(add);
    let guard = 0; while (out.length < n && guard++ < 80) add(draw(t));
    return out;
  }
  // Opciones de lectura (kana + romaji) para "Leer": la correcta, la trampa "regular" y lecturas de números parecidos
  function options(t, v, n = 4) {
    const right = { v, ...t.read(v) };
    const out = [right]; const seen = new Set([right.kana]);
    const trap = t.trap ? t.trap(v) : null;
    if (trap && !seen.has(trap.kana)) { seen.add(trap.kana); out.push({ v: -1, ...trap }); }
    for (const x of shuf(nearValues(t, v))) {
      if (out.length >= n) break;
      if (x === v) continue;
      const r = t.read(x); if (!seen.has(r.kana)) { seen.add(r.kana); out.push({ v: x, ...r }); }
    }
    let guard = 0;
    while (out.length < n && guard++ < 80) { const x = draw(t); if (x === v) continue; const r = t.read(x); if (!seen.has(r.kana)) { seen.add(r.kana); out.push({ v: x, ...r }); } }
    return shuf(out);
  }
  // Opciones de "qué has oído" para los temas sin teclado (meses, días de la semana, horas)
  function labelOptions(t, v, n = 4) {
    return shuf(fill(t, v, n, shuf(nearValues(t, v)), (x) => ({ v: x, label: t.show(x) }), (o) => o.label));
  }
  // ¿Lo escrito vale? Acepta las lecturas alternativas (4 = よん o し…). Devuelve el mejor resultado de Romaji.check.
  function checkSaid(t, v, input, check) {
    const rank = { ok: 3, near: 2, ko: 1, empty: 0 };
    return [t.read(v), ...(t.alts ? t.alts(v) : [])].map((r) => check(input, r)).sort((a, b) => rank[b.res] - rank[a.res])[0];
  }

  window.Numbers = { toJa, toKanji, fmt, time, COUNTERS, WEEKDAYS, digits: D, TOPICS, MIX, topic, draw, options, labelOptions, checkSaid, nearNumbers, PRICES };
})();
