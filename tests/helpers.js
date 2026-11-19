// Carga los módulos del navegador (que se cuelgan de window) en Node, con un localStorage falso.
const path = require('path');
const ROOT = path.join(__dirname, '..');

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    _data: data,
  };
}

// saved: objeto de progreso a meter en localStorage antes de cargar (o null)
function loadApp(saved = null) {
  global.window = globalThis;
  globalThis.localStorage = fakeStorage(saved ? { 'nihongo-diario-v1': JSON.stringify(saved) } : {});
  delete globalThis.Sync;
  for (const f of ['js/fsrs.js', 'js/storage.js', 'js/srs.js']) {
    const p = path.join(ROOT, f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  globalThis.Store.load();
  return { Store: globalThis.Store, SRS: globalThis.SRS, FSRS: globalThis.FSRS };
}

module.exports = { loadApp, fakeStorage, ROOT };
