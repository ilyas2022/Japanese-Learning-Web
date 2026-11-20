const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'js/romaji.js'));
require(path.join(ROOT, 'js/numbers.js'));
const N = globalThis.Numbers;

test('días del mes', () => {
  const r = (n) => N.COUNTERS.nichi.read(n).kana;
  assert.equal(r(1), 'ついたち');
  assert.equal(r(2), 'ふつか');
  assert.equal(r(3), 'みっか');
  assert.equal(r(4), 'よっか');
  assert.equal(r(8), 'ようか');
  assert.equal(r(11), 'じゅういちにち');
  assert.equal(r(14), 'じゅうよっか');
  assert.equal(r(17), 'じゅうしちにち');
  assert.equal(r(19), 'じゅうくにち');
  assert.equal(r(20), 'はつか');
  assert.equal(r(24), 'にじゅうよっか');
  assert.equal(r(31), 'さんじゅういちにち');
});

test('cada tema sabe leer todos sus valores', () => {
  for (const t of N.TOPICS) {
    const vals = t.items ? t.items() : Array.from({ length: 200 }, () => t.gen());
    for (const v of vals) {
      const r = t.read(v);
      assert.ok(r && r.kana && r.romaji, `${t.id} ${v}`);
      assert.ok(t.show(v), `${t.id} show ${v}`);
    }
  }
});

test('opciones de "Leer": 4 lecturas distintas y la correcta una sola vez', () => {
  for (const t of N.TOPICS) {
    for (let i = 0; i < 40; i++) {
      const v = N.draw(t);
      const opts = N.options(t, v);
      assert.equal(opts.length, 4, `${t.id} ${v}`);
      assert.equal(new Set(opts.map((o) => o.kana)).size, 4, `${t.id} ${v}`);
      assert.equal(opts.filter((o) => o.v === v).length, 1, `${t.id} ${v}`);
      assert.equal(opts.find((o) => o.v === v).kana, t.read(v).kana);
    }
  }
});

test('la trampa de los contadores es la forma "regular" que no existe', () => {
  const t = N.topic('nin');
  for (let i = 0; i < 20; i++) {
    const opts = N.options(t, 4);
    const trap = opts.find((o) => o.v === -1);
    assert.ok(trap);
    assert.equal(trap.kana, 'よんにん');
  }
});

test('opciones al oír (meses, días de la semana, horas)', () => {
  for (const id of ['gatsu', 'youbi', 'horas']) {
    const t = N.topic(id);
    assert.equal(t.keypad, false);
    for (let i = 0; i < 30; i++) {
      const v = N.draw(t);
      const opts = N.labelOptions(t, v);
      assert.equal(opts.length, 4);
      assert.equal(new Set(opts.map((o) => o.label)).size, 4);
      assert.ok(opts.some((o) => o.v === v));
    }
  }
});

test('decir: acepta las lecturas alternativas', () => {
  const t = N.topic('d10');
  assert.equal(N.checkSaid(t, 4, 'yon', globalThis.Romaji.check).res, 'ok');
  assert.equal(N.checkSaid(t, 4, 'shi', globalThis.Romaji.check).res, 'ok');
  assert.equal(N.checkSaid(t, 9, 'kyuu', globalThis.Romaji.check).res, 'ok');
  assert.equal(N.checkSaid(t, 9, 'ni', globalThis.Romaji.check).res, 'ko');
  assert.equal(N.checkSaid(N.topic('nichi'), 20, 'hatsuka', globalThis.Romaji.check).res, 'ok');
});
