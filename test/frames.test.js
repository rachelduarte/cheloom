import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, DEFAULT_FRAME, DEFAULT_FRAME_WIDTH, frameStyle, isHexColor } from '../src/shared/frames.js';

test('marcos disponibles, en orden, con Degradado por defecto', () => {
  assert.deepEqual(Object.keys(FRAMES), [
    'gradient',
    'sunset',
    'horizon',
    'magenta',
    'cloud',
    'lead',
    'blackout',
    'none',
    'custom',
  ]);
  assert.equal(DEFAULT_FRAME, 'gradient');
});

test('colores sólidos usan el hex exacto de la paleta', () => {
  assert.deepEqual(frameStyle('horizon'), { background: '#20BEC6', width: DEFAULT_FRAME_WIDTH });
  assert.deepEqual(frameStyle('magenta'), { background: '#ED0180', width: DEFAULT_FRAME_WIDTH });
  assert.deepEqual(frameStyle('blackout'), { background: '#0A0F0F', width: DEFAULT_FRAME_WIDTH });
});

test('Degradado va de Horizon a Magenta', () => {
  assert.match(frameStyle('gradient').background, /linear-gradient\(.*#20BEC6.*#ED0180/);
});

test('Sin marco no tiene borde', () => {
  assert.deepEqual(frameStyle('none'), { background: 'transparent', width: 0 });
});

test('Personalizado usa el hex elegido', () => {
  assert.deepEqual(frameStyle('custom', '#ff8800'), { background: '#ff8800', width: DEFAULT_FRAME_WIDTH });
});

test('Personalizado con hex inválido cae en Degradado', () => {
  assert.deepEqual(frameStyle('custom', 'rojo'), frameStyle('gradient'));
  assert.deepEqual(frameStyle('custom', '#12345'), frameStyle('gradient'));
});

test('un marco desconocido cae en Degradado', () => {
  assert.deepEqual(frameStyle('arcoiris'), frameStyle('gradient'));
});

test('isHexColor solo acepta #RRGGBB', () => {
  assert.equal(isHexColor('#A1b2C3'), true);
  assert.equal(isHexColor('#abc'), false);
  assert.equal(isHexColor('url(x)'), false);
  assert.equal(isHexColor(undefined), false);
});
