// Romaji → kana y corrección tolerante de respuestas escritas.
// Escribes con el teclado normal ("arigatou") y se compara en kana con la respuesta.
// Si escribes directamente en kana (teclado japonés), también vale.
(function (root) {
  const T = {};
  const add = (map) => Object.entries(map).forEach(([r, k]) => { T[r] = k; });
  // Básicos
  const rows = {
    '': ['あ', 'い', 'う', 'え', 'お'], k: ['か', 'き', 'く', 'け', 'こ'], g: ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    s: ['さ', 'し', 'す', 'せ', 'そ'], z: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'], t: ['た', 'ち', 'つ', 'て', 'と'],
    d: ['だ', 'ぢ', 'づ', 'で', 'ど'], n: ['な', 'に', 'ぬ', 'ね', 'の'], h: ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    b: ['ば', 'び', 'ぶ', 'べ', 'ぼ'], p: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'], m: ['ま', 'み', 'む', 'め', 'も'],
    r: ['ら', 'り', 'る', 'れ', 'ろ'], l: ['ら', 'り', 'る', 'れ', 'ろ'],
  };
  Object.entries(rows).forEach(([c, ks]) => ['a', 'i', 'u', 'e', 'o'].forEach((v, i) => { T[c + v] = ks[i]; }));
  add({
    ya: 'や', yu: 'ゆ', yo: 'よ', ye: 'いぇ', wa: 'わ', wo: 'を', wi: 'うぃ', we: 'うぇ',
    shi: 'し', chi: 'ち', tsu: 'つ', fu: 'ふ', ji: 'じ', zi: 'じ', si: 'し', ti: 'ち', tu: 'つ', hu: 'ふ', di: 'ぢ', du: 'づ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', she: 'しぇ', che: 'ちぇ', je: 'じぇ', tsa: 'つぁ',
    thi: 'てぃ', dhi: 'でぃ', dhu: 'でゅ', twu: 'とぅ', dwu: 'どぅ', va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ', la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ',
    xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ', xtsu: 'っ', xtu: 'っ', ltu: 'っ', ltsu: 'っ',
    '-': 'ー', ',': '、', '.': '。', '?': '？', '!': '！', '~': '〜',
  });
  // Combinaciones con ゃ ゅ ょ
  const small = { a: 'ゃ', u: 'ゅ', o: 'ょ' };
  const yoon = { ky: 'き', gy: 'ぎ', ny: 'に', hy: 'ひ', by: 'び', py: 'ぴ', my: 'み', ry: 'り', dy: 'ぢ',
    sh: 'し', sy: 'し', ch: 'ち', ty: 'ち', cy: 'ち', j: 'じ', jy: 'じ', zy: 'じ' };
  Object.entries(yoon).forEach(([c, k]) => Object.entries(small).forEach(([v, s]) => { T[c + v] = k + s; }));

  const VOWELS = 'aeiou';
  const MAXLEN = 4;
  const MACRON = { 'ā': 'aa', 'ī': 'ii', 'ū': 'uu', 'ē': 'ee', 'ō': 'ou', 'â': 'aa', 'î': 'ii', 'û': 'uu', 'ê': 'ee', 'ô': 'ou' };

  function toKana(input) {
    const s = String(input || '').toLowerCase().replace(/[āīūēōâîûêô]/g, (c) => MACRON[c]);
    let out = '', i = 0;
    while (i < s.length) {
      const c = s[i], n1 = s[i + 1];
      if (!/[a-z'\-,.?!~]/.test(c)) { out += c; i++; continue; } // kana, espacios, etc. tal cual
      if (c === "'") { i++; continue; }
      // っ: consonante doble (kitte, zasshi) o "tch" (matcha)
      if (c === n1 && !VOWELS.includes(c) && c !== 'n' && /[a-z]/.test(c)) { out += 'っ'; i++; continue; }
      if (c === 't' && n1 === 'c' && s[i + 2] === 'h') { out += 'っ'; i++; continue; }
      // ん: n que no va seguida de vocal ni de y (konban, hon'ya, konnichiwa)
      if (c === 'n') {
        if (n1 === "'") { out += 'ん'; i += 2; continue; }
        if (n1 === undefined || (!VOWELS.includes(n1) && n1 !== 'y')) {
          out += 'ん'; i += n1 === 'n' && !(s[i + 2] && (VOWELS.includes(s[i + 2]) || s[i + 2] === 'y')) ? 2 : 1;
          continue;
        }
      }
      let hit = false;
      for (let len = MAXLEN; len >= 1; len--) {
        const k = T[s.slice(i, i + len)];
        if (k) { out += k; i += len; hit = true; break; }
      }
      if (!hit) { out += c; i++; } // consonante suelta mientras escribes
    }
    return out;
  }

  // ---------- normalización para comparar ----------
  const VOWEL_OF = {};
  Object.entries(T).forEach(([r, k]) => { const v = r[r.length - 1]; if (VOWELS.includes(v)) VOWEL_OF[k[k.length - 1]] = v; });
  Object.assign(VOWEL_OF, { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o', 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o' });
  delete VOWEL_OF['っ']; // xtsu/ltu no tienen vocal propia
  const VOWEL_KANA = { a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お' };

  const toHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const strip = (s) => s.replace(/[\s、。，．！？!?,.…〜~・「」『』()（）'"\-]/g, '');

  // Forma estricta: hiragana, sin signos, ー → vocal, を=お, ぢ=じ, づ=ず, おう=おお, えい=ええ (se pronuncian igual)
  function norm(s) {
    const h = strip(toHira(String(s || '')));
    let out = '';
    for (const ch of h) {
      const prevV = VOWEL_OF[out[out.length - 1]];
      if (ch === 'ー') { out += prevV ? VOWEL_KANA[prevV] : ''; continue; }
      let c = { 'を': 'お', 'ぢ': 'じ', 'づ': 'ず' }[ch] || ch;
      if (prevV === 'o' && c === 'う') c = 'お';
      if (prevV === 'e' && c === 'い') c = 'え';
      out += c;
    }
    return out;
  }
  // Forma laxa: además ignora la longitud de las vocales y la っ (para detectar "casi")
  function loose(s) {
    const n = norm(s).replace(/っ/g, '');
    let out = '';
    for (const ch of n) {
      const prevV = VOWEL_OF[out[out.length - 1]];
      if (prevV && VOWEL_KANA[prevV] === ch) continue;
      out += ch;
    }
    return out;
  }

  function lev(a, b) {
    a = [...a]; b = [...b];
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    return d[a.length][b.length];
  }

  // Comprueba lo escrito contra una frase { kana, romaji }.
  // res: 'ok' | 'near' (casi: vocal larga, っ o una letra) | 'ko' | 'empty'
  function check(input, item) {
    const got = norm(toKana(input));
    if (!got) return { res: 'empty', got: '' };
    const targets = [...new Set([norm(item.kana), norm(toKana(item.romaji))].filter(Boolean))];
    if (targets.includes(got)) return { res: 'ok', got };
    if (targets.some((t) => loose(t) === loose(got))) return { res: 'near', why: 'long', got };
    const dist = Math.min(...targets.map((t) => lev(t, got)));
    const len = Math.max(...targets.map((t) => [...t].length));
    if (dist <= (len >= 10 ? 2 : 1)) return { res: 'near', why: 'typo', got, dist };
    return { res: 'ko', got, dist };
  }

  root.Romaji = { toKana, norm, loose, check, lev };
})(typeof window !== 'undefined' ? window : globalThis);
