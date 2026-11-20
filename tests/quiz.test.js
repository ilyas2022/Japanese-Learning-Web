const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'js/quiz.js'));
const { makeDeck, uniqueDraw, autoGrade, similar, rolling, pct } = globalThis.Quiz;

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

test('la baraja de 0-10 da los 11 números sin repetir', () => {
  for (let r = 0; r < 50; r++) {
    const d = makeDeck(range(0, 10));
    const got = d.take(11);
    assert.equal(got.length, 11);
    assert.deepEqual([...got].sort((a, b) => a - b), range(0, 10));
  }
});

test('al rebarajar no repite el último número', () => {
  for (let r = 0; r < 200; r++) {
    const d = makeDeck([1, 2, 3]);
    const seq = Array.from({ length: 30 }, () => d.next());
    for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1]);
  }
});

test('take(n) en conjuntos grandes: n distintos y recorre todo antes de repetir', () => {
  const d = makeDeck(range(1, 31));
  const a = d.take(10), b = d.take(10), c = d.take(10);
  assert.equal(new Set(a).size, 10);
  assert.equal(new Set([...a, ...b, ...c]).size, 30);
  const e = d.take(10); // queda 1 del primer barajado y se rebaraja sin duplicar dentro de la ronda
  assert.equal(new Set(e).size, 10);
});

test('uniqueDraw no repite valores', () => {
  let i = 0;
  const got = uniqueDraw(() => (i++ % 5), 5);
  assert.deepEqual([...got].sort(), [0, 1, 2, 3, 4]);
});

test('nota automática', () => {
  assert.equal(autoGrade({ type: 'meaning', ok: false }), 0);
  assert.equal(autoGrade({ type: 'meaning', ok: true, ms: 2000 }), 2);
  assert.equal(autoGrade({ type: 'listen', ok: true, ms: 9000 }), 1);
  assert.equal(autoGrade({ type: 'build', ok: true, ms: 1000 }), 2);
  assert.equal(autoGrade({ type: 'write', ok: true, ms: 3000, len: 5 }), 3);
  assert.equal(autoGrade({ type: 'write', ok: true, ms: 20000, len: 5 }), 2);
  assert.equal(autoGrade({ type: 'write', ok: false, near: true }), 1);
  assert.equal(autoGrade({ type: 'write', ok: false, override: true }), 2);
});

test('distractores ambiguos', () => {
  assert.ok(similar({ kana: 'ありがとう', es: 'Gracias (informal)' }, { kana: 'ありがとうございます', es: 'Muchas gracias (educado)' }));
  assert.ok(similar({ kana: 'うん', es: 'Sí (informal)' }, { kana: 'はい', es: 'Sí / Vale / Le escucho' }));
  assert.ok(!similar({ kana: 'すみません', es: 'Perdone' }, { kana: 'おやすみ', es: 'Buenas noches' }));
  assert.ok(similar({ kana: 'もういっかい', es: '¡Otra vez! / ¡Una más!' }, { kana: 'もういちどおねがいします', es: 'Otra vez, por favor' }));
  assert.ok(!similar({ kana: 'またね', es: '¡Nos vemos!' }, { kana: 'またあした', es: '¡Hasta mañana!' }));
});

test('acierto reciente: últimos 20', () => {
  let h = [];
  for (let i = 0; i < 30; i++) h = rolling(h, i >= 10);
  assert.equal(h.length, 20);
  assert.equal(pct(h), 100);
  assert.equal(pct([]), null);
});
