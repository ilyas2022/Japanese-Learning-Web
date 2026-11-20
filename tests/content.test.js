const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'data/content.js'));

test('ningún item de la Ruta principal es una plantilla con 〜', () => {
  const bad = window.ITEMS_LIST.filter((it) => it.kind === 'core' && /[〜~]/.test(it.jp)).map((it) => it.jp);
  assert.deepEqual(bad, []);
});

test('ninguna frase (de ninguna unidad) tiene huecos de plantilla en japonés, romaji o español', () => {
  const bad = window.ITEMS_LIST
    .filter((it) => /[〜~]/.test(it.jp + it.romaji + it.es) || /(^|\s)-[a-z]/.test(it.romaji) || /\s-\?|¿\s*-|\(\s*\)/.test(it.es))
    .map((it) => `${it.jp} = ${it.es}`);
  assert.deepEqual(bad, []);
});

test('los ids (el texto japonés) son únicos', () => {
  const ids = window.ITEMS_LIST.map((it) => it.id);
  assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), []);
});

test('cada desglose (parts) está completo', () => {
  for (const it of window.ITEMS_LIST) {
    if (!it.parts) continue;
    for (const [j, e] of it.parts) assert.ok(j && e, `${it.jp}: ${j}=${e}`);
  }
});

test('ningún significado en español se repite (si no, "dilo en japonés" sería ambiguo)', () => {
  const seen = {};
  const dup = [];
  for (const it of window.ITEMS_LIST) { if (seen[it.es]) dup.push(`${it.es}: ${seen[it.es]} / ${it.jp}`); seen[it.es] = it.jp; }
  assert.deepEqual(dup, []);
});

test('toda frase de 2+ palabras tiene desglose', () => {
  const words = (it) => it.romaji.replace(/[!?.…,~、。！？]/g, ' ').split(/\s+/).filter(Boolean).length;
  const bad = window.ITEMS_LIST.filter((it) => words(it) >= 2 && !(it.parts && it.parts.length >= 2)).map((it) => it.jp);
  assert.deepEqual(bad, []);
});

test('el desglose, junto, es la frase japonesa', () => {
  const core = (s) => s.replace(/[\s、。！？!?…「」]/g, '');
  const bad = window.ITEMS_LIST.filter((it) => it.parts && core(it.parts.map(([j]) => j).join('')) !== core(it.jp)).map((it) => it.jp);
  assert.deepEqual(bad, []);
});

test('no vuelven las palabras sueltas (ahora van dentro de una frase)', () => {
  const LOOSE = ['ラブホ', 'おっぱい', 'お尻', 'ちんこ', 'まんこ', 'セフレ', 'ワンナイト', '浮気', '元カノ', 'スケベ', 'バカ', 'アホ', 'バカ野郎',
    'クソ野郎', '変態', 'てめえ', '貴様', 'ブス', 'デブ', 'ダサい', '最低', 'めっちゃ', 'ガチで', '草', 'ドヤ顔', 'リア充', 'ぼっち', '中二病',
    'オタク', 'ペラペラ', 'ドキドキ', 'お前', 'お客様', '二日酔い'];
  const ids = new Set(window.ITEMS_LIST.map((it) => it.jp));
  assert.deepEqual(LOOSE.filter((w) => ids.has(w)), []);
});

test('las frases "solo para entender" existen y no son de las que vas a decir', () => {
  assert.ok(window.HEAR_ONLY.size >= 4);
  const ids = new Set(window.ITEMS_LIST.map((it) => it.id));
  for (const id of window.HEAR_ONLY) assert.ok(ids.has(id), id);
});
