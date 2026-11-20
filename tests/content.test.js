const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { ROOT } = require('./helpers');

global.window = globalThis;
require(path.join(ROOT, 'data/content.js'));
require(path.join(ROOT, 'data/renamed.js'));

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

test('todos los destinos de RENAMED existen y los orígenes ya no', () => {
  const ids = new Set(window.ITEMS_LIST.map((it) => it.id));
  for (const [from, to] of Object.entries(window.RENAMED)) {
    assert.ok(ids.has(to), `${from} → ${to} no existe`);
    assert.ok(!ids.has(from), `${from} sigue en el contenido`);
  }
});

test('cada desglose (parts) está completo', () => {
  for (const it of window.ITEMS_LIST) {
    if (!it.parts) continue;
    for (const [j, e] of it.parts) assert.ok(j && e, `${it.jp}: ${j}=${e}`);
  }
});
