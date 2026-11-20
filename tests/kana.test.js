const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'js/romaji.js'));
require(path.join(ROOT, 'data/kana.js'));
const { toKana, norm } = globalThis.Romaji;

test('palabras en katakana: el romaji coincide con el kana (para el modo Escribir)', () => {
  const bad = window.KATAKANA_WORDS.filter(([jp, r]) => norm(toKana(r)) !== norm(jp)).map(([jp, r]) => `${jp} ≠ ${r} (${toKana(r)})`);
  assert.deepEqual(bad, []);
});

test('kana confundibles', () => {
  assert.deepEqual(window.kanaConfusables('シ', 'k'), ['ツ']);
  assert.ok(window.kanaConfusables('ぬ', 'h').includes('め'));
  assert.ok(window.kanaConfusables('ね', 'h').includes('れ'));
  // solo kana dentro de los grupos
  for (const sc of ['h', 'k']) {
    const all = new Set(window.allKana(sc).map((k) => k.ch));
    for (const g of window.KANA_CONFUSE[sc]) for (const ch of g) assert.ok(all.has(ch), `${sc}: ${ch}`);
  }
});

test('leer palabras: solo con los kana que ya conoces', () => {
  const known = new Set(['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ']);
  assert.ok(window.kanaReadable('あき', known));
  assert.ok(!window.kanaReadable('すし', known));
  assert.ok(window.kanaReadable('かっこいい', known), 'っ no cuenta');
  const kk = new Set(['コ', 'ヒ']);
  assert.ok(window.kanaReadable('コーヒー', kk), 'ー no cuenta');
});

test('todos los kana tienen truco', () => {
  for (const sc of ['h', 'k']) {
    const basic = window.allKana(sc).filter((k) => ['a', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'].includes(k.row));
    const missing = basic.filter((k) => !window.KANA_MNEMO[sc][k.ch]).map((k) => k.ch);
    assert.deepEqual(missing, []);
  }
});
