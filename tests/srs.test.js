const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers');

test('frase aprendida en Hoy: reconocer mañana, producir aún bloqueado', () => {
  const { Store, SRS } = loadApp();
  const t = Store.today();
  assert.ok(SRS.addItem('c:はい', 1));
  const e = Store.s.srs['c:はい'];
  assert.equal(e.r.due, t + 1);
  assert.equal(e.p, null);
  assert.deepEqual(SRS.due(), []);
  Store.s.dayOffset = 1;
  assert.deepEqual(SRS.due(), ['c:はい|r']);
});

test('producir se desbloquea cuando reconocer llega a 3 días de estabilidad', () => {
  const { Store, SRS } = loadApp();
  SRS.addItem('c:はい', 1);
  let guard = 0;
  while (!Store.s.srs['c:はい'].p && guard++ < 10) {
    Store.s.dayOffset += Store.s.srs['c:はい'].r.due - Store.today();
    SRS.grade('c:はい|r', 2);
  }
  const e = Store.s.srs['c:はい'];
  assert.ok(e.p, 'producir desbloqueado');
  assert.ok(e.r.s >= SRS.UNLOCK_P);
  assert.equal(e.p.due, Store.today() + 1);
});

test('grade registra aciertos y fallos del día', () => {
  const { Store, SRS } = loadApp();
  SRS.addItem('c:はい', 0); SRS.addItem('c:うん', 0);
  SRS.grade('c:はい|r', 2); SRS.grade('c:うん|r', 0);
  const l = Store.s.log[Store.today()];
  assert.equal(l.ok, 1); assert.equal(l.fail, 1); assert.equal(l.reviews, 2);
});

test('miss sin lado usa producir si existe', () => {
  const { Store, SRS } = loadApp();
  SRS.addItem('c:はい', 1);
  Store.s.srs['c:はい'].p = { s: 5, d: 5, due: Store.today() + 5, last: Store.today() - 1, reps: 1, lapses: 0 };
  SRS.miss('c:はい');
  assert.equal(Store.s.srs['c:はい'].p.lapses, 1);
  assert.equal(Store.s.srs['c:はい'].r.lapses, 0);
});

test('migración v2 → v3 conserva todas las tarjetas y la racha', () => {
  const v2 = {
    v: 2, settings: { romaji: true, perDay: 5, reviewMode: 'es' },
    srs: {
      'c:はい': { due: 20000, ivl: 30, ease: 2.6, reps: 5, lapses: 0, added: 19900, last: 19970 },
      'c:うん': { due: 19999, ivl: 1, ease: 1.9, reps: 2, lapses: 2, added: 19990 },
      'c:どうも': { due: 19999, ivl: 0, ease: 2.5, reps: 0, lapses: 1, added: 19995 },
    },
    streak: { count: 12, last: 19999, best: 20 }, kana: { 'h:あ': { c: 3, w: 0, s: 3 } }, log: {},
  };
  const { Store, SRS } = loadApp(v2);
  const s = Store.s;
  assert.equal(s.v, 3);
  assert.equal(Object.keys(s.srs).length, 3);
  assert.equal(s.streak.count, 12);
  assert.equal(s.kana['h:あ'].c, 3);
  assert.equal(s.kana['h:あ'].f.s, 7, 'kana dominado conserva el nivel en FSRS');
  assert.equal(s.settings.reviewMode, 'p');
  const hai = s.srs['c:はい'];
  assert.equal(hai.r.s, 30); assert.equal(hai.r.due, 20000); assert.equal(hai.r.last, 19970);
  assert.ok(hai.r.d < 5, 'ease alta → dificultad baja');
  assert.ok(hai.p && hai.p.s === 15, 'madura: producir arranca con la mitad');
  assert.equal(s.srs['c:うん'].p, null, 'intervalo corto: producir bloqueado');
  assert.ok(s.srs['c:うん'].r.d > 5, 'ease baja → dificultad alta');
  assert.equal(s.srs['c:うん'].r.lapses, 2);
  assert.equal(SRS.item('c:はい').level, 'madura');
  // la migración es idempotente
  assert.equal(Store.migrate(s), false);
});

test('el día cambia a las 4:00', () => {
  const { Store } = loadApp();
  const real = Date.now;
  try {
    const at = (h) => { const d = new Date(2026, 10, 19, h, 30); Date.now = () => d.getTime(); return Store.today(); };
    assert.equal(at(3), at(0));
    assert.equal(at(5), at(3) + 1);
    assert.equal(at(23), at(5));
  } finally { Date.now = real; }
});
