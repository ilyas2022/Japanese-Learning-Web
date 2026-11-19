const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const { FSRS } = loadApp();

test('R(S, S) = 90 % y el intervalo al 90 % es la estabilidad', () => {
  for (const S of [1, 5, 30, 200]) {
    assert.ok(Math.abs(FSRS.retrievability(S, S) - 0.9) < 1e-9);
    assert.equal(FSRS.interval(S, 0.9), Math.round(S));
  }
});

test('más retención objetivo → intervalos más cortos', () => {
  assert.ok(FSRS.interval(30, 0.95) < FSRS.interval(30, 0.9));
  assert.ok(FSRS.interval(30, 0.85) > FSRS.interval(30, 0.9));
});

test('tarjeta nueva: estabilidad inicial = pesos w0..w3', () => {
  const o = FSRS.options({ s: null, d: null }, 100);
  assert.deepEqual(o.map((c) => c.s), FSRS.W.slice(0, 4).map((w) => +w.toFixed(4)));
  assert.ok(o[0].d > o[2].d && o[2].d > o[3].d, 'Otra vez = más difícil que Fácil');
});

test('intervalos ordenados: otra vez < difícil ≤ bien < fácil', () => {
  const card = { s: 10, d: 5, last: 90, reps: 3, lapses: 0 };
  const o = FSRS.options(card, 100);
  assert.equal(o[0].ivl, 1);
  assert.ok(o[1].ivl <= o[2].ivl && o[2].ivl < o[3].ivl);
});

test('repasar "Bien" a tiempo hace crecer los intervalos', () => {
  let c = FSRS.options({ s: null, d: null }, 0)[2]; let day = 0; const ivls = [];
  for (let i = 0; i < 6; i++) { day += c.ivl; c = FSRS.options(c, day)[2]; ivls.push(c.ivl); }
  for (let i = 1; i < ivls.length; i++) assert.ok(ivls[i] > ivls[i - 1], `intervalos: ${ivls}`);
});

test('"Otra vez" baja la estabilidad y cuenta un fallo', () => {
  const card = { s: 30, d: 5, last: 70, reps: 5, lapses: 0 };
  const c = FSRS.options(card, 100)[0];
  assert.ok(c.s < 30);
  assert.equal(c.lapses, 1);
  assert.ok(c.d > 5);
});

test('repetir el mismo día no cuenta como fallo nuevo', () => {
  const card = { s: 2, d: 5, last: 100, reps: 2, lapses: 1 };
  assert.equal(FSRS.options(card, 100)[0].lapses, 1);
});

test('fuzz: ±5 % y nunca toca intervalos cortos', () => {
  assert.equal(FSRS.fuzz(1), 1);
  assert.equal(FSRS.fuzz(2), 2);
  for (let i = 0; i < 200; i++) {
    const f = FSRS.fuzz(100);
    assert.ok(f >= 95 && f <= 105, String(f));
  }
});
