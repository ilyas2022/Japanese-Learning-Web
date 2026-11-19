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

  window.Numbers = { toJa, toKanji, fmt, time, COUNTERS, WEEKDAYS, digits: D };
})();
