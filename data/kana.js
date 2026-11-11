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
    'き': 'Parece una llave (key) → "ki".',
    'く': 'El pico abierto de un pájaro haciendo "cu-cú".',
    'け': 'Un barril (keg) con un grifo al lado.',
    'こ': 'Dos peces koi nadando uno sobre otro.',
    'さ': 'Un samurái de pie con la espada inclinada.',
    'し': 'Un anzuelo: "pesca con ella (she)" → shi.',
    'す': 'Un columpio dando vueltas: "Sssu".',
    'せ': 'Una boca con un colmillo: "¡SE-ñor vampiro!"',
    'そ': 'Una costura en zigzag: "so"-bre la tela.',
    'た': 'Si lo miras bien verás una "t" y una "a": ta.',
    'ち': 'Una cara sonriendo de perfil… o un 5 al revés: chi.',
    'つ': 'Una ola de TSUnami rompiendo.',
    'て': 'Una "T" torcida que extiende la mano (te = mano).',
    'と': 'Un dedo del pie (toe) con una astilla clavada.',
    'な': 'Una monja (nun) rezando junto a una cruz: na.',
    'に': 'Una "N" con dos rayitas: ni (ni = 2).',
    'ぬ': 'Un plato de fideos (noodles) con palillos: nu.',
    'ね': 'Un gato (neko) con la cola enroscada: ne.',
    'の': 'Una señal de prohibido: "¡NO!"',
    'は': 'Una persona riéndose a carcajadas: "¡Ha-ha!"',
    'ひ': 'Una gran sonrisa: "¡Hi-hi!"',
    'ふ': 'El Monte FUji con nubes alrededor.',
    'へ': 'El tejado de una casa / una colina: "¡Eh, hey!"',
    'ほ': 'Un muñeco de nieve con bufanda: "¡Ho-ho-ho!"',
    'ま': 'Mamá con un collar de dos vueltas: ma.',
    'み': 'Parece un 21: "MI cumpleaños 21".',
    'む': 'Una vaca de perfil diciendo "¡Muuu!"',
    'め': 'Un ojo (me = ojo) con una pestaña larga.',
    'も': 'Un anzuelo con MÁS cebo (more): mo.',
    'や': 'Un yak con sus cuernos: ya.',
    'ゆ': 'Un pez nadando dentro de una U: yu.',
    'よ': 'Un yo-yo colgando de un hilo.',
    'ら': 'Un rapero con gorra de lado: ra.',
    'り': 'Las dos orillas de un RÍo: ri.',
    'る': 'Un 3 con un rizo (RUlo) al final.',
    'れ': 'Un REy arrodillado con su capa.',
    'ろ': 'Un 3 sin rizo, como una ROca lisa.',
    'わ': 'Un cisne nadando en el agua: "wa".',
    'を': 'Alguien gritando "¡Wooo!" (casi solo se usa como partícula, suena "o").',
    'ん': 'Una "n" minúscula escrita a mano.',
  },
  k: {
    'ア': 'Un hacha (axe) clavada: a.',
    'イ': 'Un águila (eagle) en una rama: i.',
    'ウ': 'Una "u" con sombrero: u.',
    'エ': 'Una viga de hierro (I de elevador): e.',
    'オ': 'Alguien corriendo con los brazos abiertos: "¡Oh!"',
    'カ': 'Como か pero sin la gota de sudor: ka.',
    'キ': 'Una llave (key) con dos dientes: ki.',
    'ク': 'El pico de un CUervo: ku.',
    'ケ': 'Una "K" torcida: ke.',
    'コ': 'La esquina de una caja (CO-rner): ko.',
    'サ': 'Una mesa con un plato de SAlsa: sa.',
    'シ': 'Carita sonriente mirando ARRIBA. Trazos casi horizontales.',
    'ス': 'Alguien columpiándose: su.',
    'セ': 'Como せ pero más recto: se.',
    'ソ': 'Una aguja cosiendo HACIA ABAJO (so). No confundir con ン.',
    'タ': 'Como ク con una rayita dentro: ta.',
    'チ': 'Una animadora (CHIrleader) con los brazos en alto: chi.',
    'ツ': 'Carita mirando hacia ABAJO, trazos verticales: tsu. Ojo con シ.',
    'テ': 'Un TElescopio en su trípode: te.',
    'ト': 'Un TÓtem con una rama: to.',
    'ナ': 'Una NAvaja en cruz: na.',
    'ニ': 'Dos líneas: ni (ni = 2 en japonés).',
    'ヌ': 'Unos palillos con fideos (noodles): nu.',
    'ネ': 'Un collar (NEcklace) colgando: ne.',
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
    'ン': 'Persona dormida, trazo de ABAJO hacia ARRIBA: n. Ojo con ソ.',
  }
};

// Palabras para practicar lectura de katakana (préstamos útiles)
window.KATAKANA_WORDS = [
  ['コーヒー','koohii','café'], ['テレビ','terebi','televisión'], ['パン','pan','pan'],
  ['カメラ','kamera','cámara'], ['ゲーム','geemu','videojuego'], ['アニメ','anime','anime'],
  ['ホテル','hoteru','hotel'], ['タクシー','takushii','taxi'], ['ビール','biiru','cerveza'],
  ['ケーキ','keeki','tarta'], ['アイス','aisu','helado'], ['スマホ','sumaho','smartphone'],
  ['パソコン','pasokon','ordenador'], ['レストラン','resutoran','restaurante'],
  ['コンビニ','konbini','tienda 24h'], ['ラーメン','raamen','ramen'],
  ['チョコレート','chokoreeto','chocolate'], ['デート','deeto','cita romántica'],
  ['キス','kisu','beso'], ['ハンバーガー','hanbaagaa','hamburguesa'], ['スペイン','supein','España'],
  ['サッカー','sakkaa','fútbol'], ['ドア','doa','puerta'], ['トイレ','toire','baño'],
  ['メニュー','menyuu','menú'], ['ジュース','juusu','zumo'], ['シャツ','shatsu','camisa'],
  ['バス','basu','autobús'], ['ペン','pen','bolígrafo'], ['ノート','nooto','cuaderno'],
  ['ヒーロー','hiiroo','héroe'], ['パンチ','panchi','puñetazo'], ['ロボット','robotto','robot'],
];

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
