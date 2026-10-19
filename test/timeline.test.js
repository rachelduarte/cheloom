import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_CLIP,
  createTimeline,
  totalDuration,
  split,
  remove,
  trim,
  move,
  locate,
  clipOffset,
} from '../src/shared/timeline.js';

const spans = (tl) => tl.clips.map((c) => [c.start, c.end]);

test('una línea nueva tiene un solo fragmento con toda la grabación', () => {
  const tl = createTimeline(20);
  assert.equal(tl.source, 20);
  assert.deepEqual(spans(tl), [[0, 20]]);
  assert.equal(totalDuration(tl), 20);
});

test('dividir parte el fragmento bajo el cabezal', () => {
  const tl = split(createTimeline(20), 8);
  assert.deepEqual(spans(tl), [
    [0, 8],
    [8, 20],
  ]);
  assert.notEqual(tl.clips[0].id, tl.clips[1].id);
});

test('dividir usa tiempo de la línea, no de la grabación', () => {
  // [0-5] [10-20] → la línea dura 15; el segundo 7 de la línea es el 12 de la grabación
  let tl = split(split(createTimeline(20), 5), 10);
  tl = remove(tl, tl.clips[1].id);
  tl = split(tl, 7);
  assert.deepEqual(spans(tl), [
    [0, 5],
    [10, 12],
    [12, 20],
  ]);
});

test('dividir demasiado cerca de un borde no crea fragmentos diminutos', () => {
  const tl = createTimeline(20);
  assert.equal(split(tl, MIN_CLIP / 2), tl);
  assert.equal(split(tl, 20 - MIN_CLIP / 2), tl);
});

test('eliminar quita el fragmento y pega el resto sin huecos', () => {
  let tl = split(split(createTimeline(20), 5), 12);
  tl = remove(tl, tl.clips[1].id);
  assert.deepEqual(spans(tl), [
    [0, 5],
    [12, 20],
  ]);
  assert.equal(totalDuration(tl), 13);
});

test('no se puede eliminar el último fragmento', () => {
  const tl = createTimeline(20);
  assert.equal(remove(tl, tl.clips[0].id), tl);
});

test('recortar el borde izquierdo y derecho', () => {
  const base = split(createTimeline(20), 10);
  const [a, b] = base.clips;
  assert.deepEqual(spans(trim(base, b.id, 'start', 12)), [
    [0, 10],
    [12, 20],
  ]);
  assert.deepEqual(spans(trim(base, a.id, 'end', 7.5)), [
    [0, 7.5],
    [10, 20],
  ]);
});

test('recortar no sale de la grabación ni baja del mínimo', () => {
  const tl = createTimeline(20);
  const id = tl.clips[0].id;
  assert.deepEqual(spans(trim(tl, id, 'start', -3)), [[0, 20]]);
  assert.deepEqual(spans(trim(tl, id, 'end', 99)), [[0, 20]]);
  assert.deepEqual(spans(trim(tl, id, 'start', 19.99)), [[20 - MIN_CLIP, 20]]);
  assert.deepEqual(spans(trim(tl, id, 'end', 0)), [[0, MIN_CLIP]]);
});

test('recortar permite recuperar parte borrada estirando el borde', () => {
  let tl = split(createTimeline(20), 10);
  tl = trim(tl, tl.clips[0].id, 'end', 6); // [0-6] [10-20]
  tl = trim(tl, tl.clips[0].id, 'end', 9); // se estira de nuevo
  assert.deepEqual(spans(tl), [
    [0, 9],
    [10, 20],
  ]);
});

test('mover cambia el orden de los fragmentos', () => {
  const tl = split(split(createTimeline(30), 10), 20);
  const [a, b, c] = tl.clips;
  assert.deepEqual(
    move(tl, c.id, 0).clips.map((x) => x.id),
    [c.id, a.id, b.id],
  );
  assert.deepEqual(
    move(tl, a.id, 2).clips.map((x) => x.id),
    [b.id, c.id, a.id],
  );
  assert.equal(move(tl, a.id, 0), tl);
});

test('locate traduce tiempo de la línea a fragmento y tiempo de la grabación', () => {
  let tl = split(split(createTimeline(20), 5), 12);
  tl = remove(tl, tl.clips[1].id); // [0-5] [12-20]
  assert.deepEqual(locate(tl, 3), { index: 0, sourceTime: 3 });
  assert.deepEqual(locate(tl, 6), { index: 1, sourceTime: 13 });
  assert.deepEqual(locate(tl, 999), { index: 1, sourceTime: 20 });
  assert.deepEqual(locate(tl, -1), { index: 0, sourceTime: 0 });
});

test('clipOffset da dónde empieza cada fragmento en la línea', () => {
  let tl = split(split(createTimeline(20), 5), 12);
  tl = remove(tl, tl.clips[1].id);
  assert.equal(clipOffset(tl, 0), 0);
  assert.equal(clipOffset(tl, 1), 5);
});

test('las operaciones no modifican el estado anterior', () => {
  const tl = createTimeline(20);
  const frozen = JSON.stringify(tl);
  split(tl, 5);
  trim(tl, tl.clips[0].id, 'end', 3);
  assert.equal(JSON.stringify(tl), frozen);
});
