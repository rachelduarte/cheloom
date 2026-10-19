import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHistory, push, undo, redo, canUndo, canRedo } from '../src/shared/history.js';

test('empieza con el estado inicial y sin deshacer', () => {
  const h = createHistory('a');
  assert.equal(h.present, 'a');
  assert.equal(canUndo(h), false);
  assert.equal(canRedo(h), false);
});

test('deshacer y rehacer', () => {
  let h = push(push(createHistory('a'), 'b'), 'c');
  h = undo(h);
  assert.equal(h.present, 'b');
  h = undo(h);
  assert.equal(h.present, 'a');
  assert.equal(canUndo(h), false);
  h = redo(h);
  assert.equal(h.present, 'b');
});

test('un cambio nuevo borra lo que se podía rehacer', () => {
  let h = undo(push(createHistory('a'), 'b'));
  h = push(h, 'x');
  assert.equal(canRedo(h), false);
  assert.equal(undo(h).present, 'a');
});

test('guardar el mismo estado no ensucia el historial', () => {
  const h = createHistory('a');
  assert.equal(push(h, 'a'), h);
});

test('el historial tiene un límite', () => {
  let h = createHistory(0);
  for (let i = 1; i <= 150; i++) h = push(h, i, 100);
  assert.equal(h.past.length, 100);
  assert.equal(h.present, 150);
});

test('deshacer o rehacer sin nada no cambia nada', () => {
  const h = createHistory('a');
  assert.equal(undo(h), h);
  assert.equal(redo(h), h);
});
