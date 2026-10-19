import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHAPES, aspectOf, sizeFor, clampSize, MIN_SIDE, MAX_SIDE } from '../src/shared/shapes.js';

test('hay exactamente tres formas: burbuja, cuadrado y rectángulo', () => {
  assert.deepEqual(Object.keys(SHAPES), ['bubble', 'square', 'rect']);
});

test('proporción de cada forma', () => {
  assert.equal(aspectOf('bubble'), 1);
  assert.equal(aspectOf('square'), 1);
  assert.equal(aspectOf('rect'), 16 / 9);
});

test('una forma desconocida cae en burbuja', () => {
  assert.equal(aspectOf('triangulo'), 1);
});

test('sizeFor conserva el área aproximada al pasar de burbuja a rectángulo', () => {
  const bubble = sizeFor('bubble', 240 * 240);
  const rect = sizeFor('rect', bubble.width * bubble.height);
  assert.deepEqual(bubble, { width: 240, height: 240 });
  assert.ok(Math.abs(rect.width * rect.height - 240 * 240) / (240 * 240) < 0.02);
  assert.ok(Math.abs(rect.width / rect.height - 16 / 9) < 0.02);
});

test('clampSize respeta el mínimo y el máximo del lado mayor', () => {
  assert.deepEqual(clampSize('square', 50), { width: MIN_SIDE, height: MIN_SIDE });
  assert.deepEqual(clampSize('square', 5000), { width: MAX_SIDE, height: MAX_SIDE });
  const r = clampSize('rect', 5000);
  assert.equal(r.width, MAX_SIDE);
  assert.equal(r.height, Math.round(MAX_SIDE / (16 / 9)));
});
