const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const mem = (s, due) => ({ s, d: 5, due, last: due - Math.round(s), reps: 3, lapses: 0, ivl: Math.round(s) });

test('al cargar se borra el progreso de las frases que ya no existen; el resto queda intacto', () => {
  const base = loadApp().Store.today();
  const saved = {
    v: 4, settings: {}, kana: {}, log: {}, nums: {},
    daily: { day: base, ids: ['c:バカ'], step: 'learn', idx: 0 },
    srs: {
      'c:バカ': { added: base - 40, r: mem(30, base + 20), p: null },
      'c:はい': { added: base - 40, r: mem(30, base + 20), p: mem(12, base + 9) },
    },
  };
  const { Store } = loadApp(saved, { content: true });
  assert.equal(Store.s.v, 5);
  assert.deepEqual(Object.keys(Store.s.srs), ['c:はい']);
  assert.equal(Store.s.srs['c:はい'].p.s, 12);
  assert.equal(Store.s.daily, null, 'el reto del día se rehace');
});

test('las frases "solo para entender" nunca piden producir', () => {
  const base = loadApp().Store.today();
  const id = 'c:いらっしゃいませ';
  const saved = { v: 5, settings: {}, kana: {}, log: {}, srs: { [id]: { added: base - 20, r: mem(10, base), p: mem(3, base) } } };
  const { SRS } = loadApp(saved, { content: true });
  assert.deepEqual(SRS.due(), [id + '|r']);
  assert.equal(SRS.unlockProduction(id), false);
  assert.equal(SRS.item(id).hasP, false);
});
