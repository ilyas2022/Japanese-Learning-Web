// Hiragana / Katakana. El katakana se deriva del hiragana (+0x60 en Unicode).
window.KANA_ROWS = [
  { id: 'a',  name: 'あ (vocales)', kana: 'あいうえお', r: ['a','i','u','e','o'] },
  { id: 'k',  name: 'か (k)', kana: 'かきくけこ', r: ['ka','ki','ku','ke','ko'] },
  { id: 's',  name: 'さ (s)', kana: 'さしすせそ', r: ['sa','shi','su','se','so'] },
  { id: 't',  name: 'た (t)', kana: 'たちつてと', r: ['ta','chi','tsu','te','to'] },
  { id: 'n',  name: 'な (n)', kana: 'なにぬねの', r: ['na','ni','nu','ne','no'] },
  { id: 'h',  name: 'は (h)', kana: 'はひふへほ', r: ['ha','hi','fu','he','ho'] },
  { id: 'm',  name: 'ま (m)', kana: 'まみむめも', r: ['ma','mi','mu','me','mo'] },
  { id: 'y',  name: 'や (y)', kana: 'や・ゆ・よ', r: ['ya',null,'yu',null,'yo'] },
  { id: 'r',  name: 'ら (r)', kana: 'らりるれろ', r: ['ra','ri','ru','re','ro'] },
  { id: 'w',  name: 'わ + ん', kana: 'わ・・をん', r: ['wa',null,null,'wo','n'] },
  { id: 'g',  name: 'が (g) ゛', kana: 'がぎぐげご', r: ['ga','gi','gu','ge','go'], extra: true },
  { id: 'z',  name: 'ざ (z) ゛', kana: 'ざじずぜぞ', r: ['za','ji','zu','ze','zo'], extra: true },
  { id: 'd',  name: 'だ (d) ゛', kana: 'だぢづでど', r: ['da','ji','zu','de','do'], extra: true },
  { id: 'b',  name: 'ば (b) ゛', kana: 'ばびぶべぼ', r: ['ba','bi','bu','be','bo'], extra: true },
  { id: 'p',  name: 'ぱ (p) ゜', kana: 'ぱぴぷぺぽ', r: ['pa','pi','pu','pe','po'], extra: true },
];

// Combinaciones (yōon): consonante + ゃ ゅ ょ pequeñas
window.KANA_COMBOS = (function () {
  const base = [
    ['き','k'],['し','sh'],['ち','ch'],['に','n'],['ひ','h'],['み','m'],['り','r'],
    ['ぎ','g'],['じ','j'],['び','b'],['ぴ','p']
  ];
  const smalls = [['ゃ','a'],['ゅ','u'],['ょ','o']];
  return base.map(([k, c]) => {
    const kana = smalls.map(([s]) => k + s);
    const r = smalls.map(([, v]) => (c === 'sh' || c === 'ch' || c === 'j') ? c + v : c + 'y' + v);
    return { id: 'c-' + k, name: k + 'ゃ', kana, r, combo: true };
  });
})();

// Mnemotécnicos en español (truco visual para recordar cada carácter)
window.KANA_MNEMO = {
  h: {
    'あ': 'Una "A" con un lazo enredado: "¡Aaah, me he liado!"',
    'い': 'Dos palitos de pie, como dos "ii".',
    'う': 'Alguien tumbado que se levanta con dolor: "¡Uuuh!"',
    'え': 'Un bailarín exótico levantando la pierna: "¡Eh!"',
    'お': 'Un golfista con su "O" de bola al lado: "¡Oh!"',
    'か': 'Un karateka con katana y una gota de sudor: "¡Ka!"',
    'き': 'Una llave antigua con dos dientes: al girarla chirría "kiii".',
    'く': 'El pico abierto de un pájaro haciendo "cu-cú".',
    'け': 'Un palo y una cruz: "¿KE es eso?". Casi igual que は, pero sin el lazo de abajo.',
    'こ': 'Dos peces koi nadando uno sobre otro.',
    'さ': 'Un SAmurái con la espada inclinada. Sin unir abajo; si se une, es ち.',
    'し': 'Un anzuelo: "pesca con ella (she)" → shi.',
    'す': 'Un columpio dando vueltas: "Sssu".',
    'せ': 'Una boca con un colmillo: "¡SE-ñor vampiro!"',
    'そ': 'Una costura en zigzag: "so"-bre la tela.',
    'た': 'Si lo miras bien verás una "t" y una "a": ta.',
    'ち': 'Un 5 mirando hacia el otro lado: CHIco que escribe al revés. Ojo con さ (abierta abajo).',
    'つ': 'Una ola de TSUnami rompiendo.',
    'て': 'Una "T" torcida que extiende la mano (te = mano).',
    'と': 'Un TOpo con una espina clavada en la cabeza.',
    'な': 'Una cruz y a su lado una NAvaja enroscada: na.',
    'に': 'Una "N" con dos rayitas: ni (ni = 2).',
    'ぬ': 'Fideos con palillos que acaban en NUdo (el rizo final). Sin rizo es め.',
    'ね': 'Un gato (neko) con la cola enroscada: ne. Sin cola es れ; con la cola abierta, わ.',
    'の': 'Una señal de prohibido: "¡NO!"',
    'は': 'Una persona riéndose a carcajadas: "¡Ha-ha!"',
    'ひ': 'Una gran sonrisa: "¡Hi-hi!"',
    'ふ': 'El Monte FUji con nubes alrededor.',
    'へ': 'El tejado de una casa / una colina: "¡Eh, hey!"',
    'ほ': 'Un muñeco de nieve con bufanda: "¡Ho-ho-ho!"',
    'ま': 'Mamá con un collar de dos vueltas: ma.',
    'み': 'Parece un 21: "MI cumpleaños 21".',
    'む': 'Una vaca de perfil diciendo "¡Muuu!"',
    'め': 'Un ojo (me = ojo en japonés). Sin el nudo de ぬ.',
    'も': 'Un anzuelo con dos cebos: el pez lo MOrdió.',
    'や': 'Un yak con sus cuernos: ya.',
    'ゆ': 'Un pez nadando dentro de una U: yu.',
    'よ': 'Un yo-yo colgando de un hilo.',
    'ら': 'Un rapero con gorra de lado: ra.',
    'り': 'Las dos orillas de un RÍo: ri.',
    'る': 'Un 3 con un RUlo al final. Sin rulo es ろ.',
    'れ': 'Un REy arrodillado con la capa estirada. Ojo con ね (gato) y わ.',
    'ろ': 'Un 3 sin rulo, liso como una ROca. Con rulo es る.',
    'わ': 'Un cisne nadando con el cuello estirado: "¡WAu!". Ojo con ね y れ.',
    'を': 'Alguien gritando "¡Wooo!" (casi solo se usa como partícula, suena "o").',
    'ん': 'Una "n" minúscula escrita a mano.',
  },
  k: {
    'ア': 'Una "A" a la que le falta la pierna derecha: a.',
    'イ': 'Un hombre apoyado en un poste esperando el bus: "i".',
    'ウ': 'Una "u" con sombrero: u.',
    'エ': 'Una viga en forma de I, como en un Edificio en obras: e.',
    'オ': 'Alguien corriendo con los brazos abiertos: "¡Oh!"',
    'カ': 'Como か pero sin la gota de sudor: ka.',
    'キ': 'Como き pero recta, sin la curva de abajo: ki.',
    'ク': 'El pico de un CUervo: ku.',
    'ケ': 'Una "K" torcida: ke.',
    'コ': 'Un COfre abierto visto de lado (dos esquinas). Si tiene la raya larga abajo, es ユ.',
    'サ': 'Una mesa con un plato de SAlsa: sa.',
    'シ': 'Carita que mira hacia ARRIBA: las rayas son casi horizontales y la cola sube desde abajo. Es shi. Ojo con ツ.',
    'ス': 'Alguien columpiándose: su. Si le cruzan un palito, es ヌ.',
    'セ': 'Como せ pero más recto: se.',
    'ソ': 'Una aguja que cose HACIA ABAJO: so. Ojo con ン (el trazo sube).',
    'タ': 'Como ク con una rayita dentro: ta.',
    'チ': 'Un CHIco con los brazos en cruz y el pelo de punta: chi.',
    'ツ': 'Carita que mira hacia ABAJO: las rayas son verticales y la cola baja desde arriba. Es tsu. Ojo con シ.',
    'テ': 'Un TElescopio en su trípode: te.',
    'ト': 'Un TÓtem con una rama: to.',
    'ナ': 'Una NAvaja en cruz: na.',
    'ニ': 'Dos líneas: ni (ni = 2 en japonés).',
    'ヌ': 'Unos palillos que cruzan los fideos: NUdo. Sin el palito cruzado es ス.',
    'ネ': 'La parte izquierda de ね (ne), con su sombrero: ne.',
    'ノ': 'Un solo trazo que dice: "¡NO!"',
    'ハ': 'Dos líneas abiertas como una carcajada: "ha".',
    'ヒ': 'Una persona sentada saludando: "¡Hi!"',
    'フ': 'La ladera del monte FUji: fu.',
    'ヘ': 'Idéntico a へ: he.',
    'ホ': 'Una cruz de HOspital con dos patitas: ho.',
    'マ': 'Un MArtillo visto de lado: ma.',
    'ミ': 'Tres líneas: "MI tres rayas".',
    'ム': 'Un MUñeco de perfil: mu.',
    'メ': 'Una X: "ME he equivocado".',
    'モ': 'Como un anzuelo con MÁS rayas: mo.',
    'ヤ': 'Un yak con un cuerno largo: ya.',
    'ユ': 'Una U de lado: yu.',
    'ヨ': 'Una E al revés: "YO-ga".',
    'ラ': 'Un RAyo con tapa: ra.',
    'リ': 'Igual que り: ri.',
    'ル': 'Dos RaÍces: ru.',
    'レ': 'Una "L" inclinada: re.',
    'ロ': 'La cabeza cuadrada de un RObot: ro.',
    'ワ': 'Una copa de vino vista de lado: "¡wa!"',
    'ヲ': 'Casi no se usa nunca: wo.',
    'ン': 'Persona dormida; el trazo largo va de ABAJO hacia ARRIBA: n. Ojo con ソ.',
  }
};

// Palabras en katakana para practicar la lectura: préstamos que vas a ver a diario en Japón.
// [kana, romaji, significado, nota opcional (falsos amigos, uso)]
window.KATAKANA_WORDS = [
  ['コンビニ','konbini','tienda 24 h (konbini)'], ['トイレ','toire','baño'], ['レジ','reji','caja (para pagar)'],
  ['レシート','reshiito','ticket de compra'], ['カード','kaado','tarjeta'], ['ポイントカード','pointo kaado','tarjeta de puntos'],
  ['スーパー','suupaa','supermercado'], ['デパート','depaato','grandes almacenes'], ['セール','seeru','rebajas'],
  ['サイズ','saizu','talla'], ['メニュー','menyuu','carta, menú'], ['ビール','biiru','cerveza'],
  ['コーヒー','koohii','café'], ['ジュース','juusu','zumo, refresco'], ['ラーメン','raamen','ramen'],
  ['カレー','karee','curry'], ['パン','pan','pan','Viene del portugués "pão".'], ['ケーキ','keeki','tarta, pastel'],
  ['アイス','aisu','helado','No es "hielo": hielo es 氷 (koori).'], ['チキン','chikin','pollo (frito)'], ['サラダ','sarada','ensalada'],
  ['タクシー','takushii','taxi'], ['バス','basu','autobús','También "baño" (bath): el contexto lo aclara.'], ['ホーム','hoomu','andén','En la estación, ホーム es el andén, no "casa".'],
  ['チケット','chiketto','entrada, billete'], ['ホテル','hoteru','hotel'], ['エレベーター','erebeetaa','ascensor'],
  ['スマホ','sumaho','móvil'], ['パソコン','pasokon','ordenador'], ['アプリ','apuri','app'],
  ['パスワード','pasuwaado','contraseña'], ['ワイファイ','waifai','wifi'], ['バッテリー','batterii','batería'],
  ['アルバイト','arubaito','trabajo a tiempo parcial','Viene del alemán "Arbeit". Abreviado: バイト.'], ['アパート','apaato','piso (edificio bajo)'], ['マンション','manshon','piso (edificio alto)','Falso amigo: no es una mansión, es un piso normal.'],
  ['テスト','tesuto','examen'], ['レポート','repooto','trabajo escrito (uni)'], ['ゼミ','zemi','seminario (uni)'],
  ['サークル','saakuru','club de la uni'], ['ノート','nooto','cuaderno','No es "nota": es la libreta.'], ['ペン','pen','bolígrafo'],
  ['シャワー','shawaa','ducha'], ['エアコン','eakon','aire acondicionado'], ['テレビ','terebi','tele'],
  ['カラオケ','karaoke','karaoke'], ['ゲーム','geemu','videojuego'], ['アニメ','anime','anime'],
  ['サッカー','sakkaa','fútbol'], ['スペイン','supein','España'], ['モロッコ','morokko','Marruecos'],
  ['レストラン','resutoran','restaurante'], ['ハンバーガー','hanbaagaa','hamburguesa'], ['チョコレート','chokoreeto','chocolate'],
];

// Kana que se confunden entre sí: salen juntos como opciones para entrenar justo esa diferencia
window.KANA_CONFUSE = {
  h: [['さ','ち','き'], ['ぬ','め','あ','お'], ['ね','れ','わ'], ['る','ろ'], ['は','ほ','け'], ['い','り'], ['こ','に','た'],
    ['う','つ','ら'], ['く','へ','し'], ['ま','も','ほ'], ['て','そ'], ['な','た','は'], ['ゆ','よ','る'], ['か','や'], ['す','む','お']],
  k: [['シ','ツ'], ['ソ','ン'], ['ノ','メ','ナ'], ['ク','タ','ケ','ワ'], ['ウ','ワ','フ','ラ'], ['コ','ユ','ヨ','ロ'], ['チ','テ','ナ'],
    ['ス','ヌ'], ['ア','マ','ヤ'], ['セ','ヒ'], ['ル','レ','ハ'], ['ニ','ミ','エ'], ['キ','チ','テ'], ['オ','ホ']],
};
window.kanaConfusables = function (ch, script) {
  const out = new Set();
  (window.KANA_CONFUSE[script] || []).forEach((g) => { if (g.includes(ch)) g.forEach((x) => { if (x !== ch) out.add(x); }); });
  return [...out];
};

// ¿Se puede leer esta palabra solo con los kana que ya conoces? (ー, っ y los pequeños ゃゅょ no cuentan)
window.KANA_EXTRAS = /[ーっッゃゅょぁぃぅぇぉャュョァィゥェォ\s、。！？!?…・]/;
window.kanaReadable = function (word, known) {
  for (const c of word) { if (window.KANA_EXTRAS.test(c)) continue; if (!known.has(c)) return false; }
  return true;
};

// Utilidades kana
window.toKatakana = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

// Lista plana de todos los kana: [{key, ch, r, row, script}]
window.allKana = function (script) {
  const out = [];
  const rows = [...window.KANA_ROWS, ...window.KANA_COMBOS];
  rows.forEach((row) => {
    const chars = Array.isArray(row.kana) ? row.kana : [...row.kana];
    chars.forEach((h, i) => {
      if (!row.r[i] || h === '・') return;
      const ch = script === 'k' ? window.toKatakana(h) : h;
      out.push({ key: script + ':' + ch, ch, r: row.r[i], row: row.id, script });
    });
  });
  return out;
};
