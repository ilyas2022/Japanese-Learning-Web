const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

const mem = (s, due) => ({ s, d: 5, due, last: due - Math.round(s), reps: 3, lapses: 0, ivl: Math.round(s) });

test('v3 → v4: el progreso de las plantillas pasa a la frase completa, con estabilidad ≤ 3', () => {
  const base = loadApp().Store.today();
  const saved = {
    v: 3, settings: {}, kana: {}, log: {}, nums: { dictado: { ok: 10, n: 12 } },
    srs: {
      'c:〜をください': { added: base - 40, r: mem(30, base + 20), p: mem(12, base + 9) },
      'c:はい': { added: base - 40, r: mem(30, base + 20), p: null },
      'c:君': { added: base - 10, r: mem(5, base + 2), p: null },          // palabra eliminada
      'c:水': { added: base - 10, r: mem(2, base + 1), p: null },          // → お水をください (ya aprendida, más fuerte)
      'c:お水をください': { added: base - 30, r: mem(15, base + 10), p: null },
    },
  };
  const { Store } = loadApp(saved, { content: true });
  const srs = Store.s.srs;
  assert.equal(Store.s.v, 4);
  assert.ok(!srs['c:〜をください']);
  const moved = srs['c:コーヒーをください'];
  assert.ok(moved);
  assert.ok(moved.r.s <= 3 && moved.p.s <= 3);
  assert.ok(moved.r.due <= Store.today() + 3);
  assert.equal(srs['c:はい'].r.s, 30, 'lo que no cambia, intacto');
  assert.ok(!srs['c:君'], 'palabra eliminada');
  assert.ok(!srs['c:水']);
  assert.equal(srs['c:お水をください'].r.s, 15, 'se queda la memoria más fuerte');
  assert.deepEqual(Store.s.nums, {});
  assert.equal(Store.s.migrated.v, 4);
  assert.equal(Store.s.migrated.dropped, 1);
});
