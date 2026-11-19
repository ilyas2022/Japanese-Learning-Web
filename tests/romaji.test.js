const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'js/romaji.js'));
require(path.join(ROOT, 'data/content.js'));
const { toKana, check } = globalThis.Romaji;

test('romaji → kana', () => {
  const cases = {
    konnichiwa: 'こんにちわ', arigatou: 'ありがとう', kitte: 'きって', "hon'ya": 'ほんや', honya: 'ほにゃ',
    onna: 'おんな', konban: 'こんばん', shinbun: 'しんぶん', matcha: 'まっちゃ', zasshi: 'ざっし',
    kyou: 'きょう', ja: 'じゃ', jaa: 'じゃあ', 'koohii': 'こおひい', 'kō': 'こう', tsukue: 'つくえ',
    'sumimasen!': 'すみません！', 'genki?': 'げんき？', fudan: 'ふだん', 'ki wo tsukete': 'き を つけて',
    nn: 'ん', 'ありがとう': 'ありがとう', k: 'k',
  };
  for (const [r, k] of Object.entries(cases)) assert.equal(toKana(r), k, r);
});

test('respuestas correctas, con espacios, mayúsculas o kana directo', () => {
  const it = { kana: 'こんにちは', romaji: 'konnichiwa' };
  for (const a of ['konnichiwa', 'Konnichiwa', 'konnichiha', 'konnichi wa', 'こんにちは', 'コンニチハ']) {
    assert.equal(check(a, it).res, 'ok', a);
  }
});

test('partículas を/は y katakana con ー', () => {
  assert.equal(check('mizu o kudasai', { kana: 'みずをください', romaji: 'mizu wo kudasai' }).res, 'ok');
  assert.equal(check('koohii', { kana: 'コーヒー', romaji: 'koohii' }).res, 'ok');
  assert.equal(check('kōhī', { kana: 'コーヒー', romaji: 'koohii' }).res, 'ok');
  assert.equal(check('wo kudasai', { kana: '〜をください', romaji: '~ wo kudasai' }).res, 'ok');
});

test('"casi": vocal larga, っ o una letra', () => {
  const it = { kana: 'おはようございます', romaji: 'ohayou gozaimasu' };
  assert.deepEqual([check('ohayo gozaimasu', it).res, check('ohayo gozaimasu', it).why], ['near', 'long']);
  assert.equal(check('kite', { kana: 'きって', romaji: 'kitte' }).res, 'near');
  assert.equal(check('ohayou gozaimazu', it).res, 'near');
  assert.equal(check('konbanwa', it).res, 'ko');
  assert.equal(check('   ', it).res, 'empty');
});

test('todas las frases del curso se aceptan escribiendo su propio romaji', () => {
  const bad = window.ITEMS_LIST.filter((it) => check(it.romaji, it).res !== 'ok').map((it) => `${it.romaji} → ${toKana(it.romaji)} ≠ ${it.kana}`);
  assert.deepEqual(bad, []);
});
