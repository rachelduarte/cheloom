import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraErrorMessage, shouldRetry, shouldFallBackToDefault } from '../src/shared/camera-errors.js';

test('cámara ocupada por otra app', () => {
  assert.match(cameraErrorMessage('NotReadableError'), /en uso/i);
  assert.match(cameraErrorMessage('AbortError'), /en uso/i);
});

test('permiso denegado apunta a la configuración de privacidad de Windows', () => {
  assert.match(cameraErrorMessage('NotAllowedError'), /privacidad/i);
});

test('cámara desconectada o inexistente', () => {
  assert.match(cameraErrorMessage('NotFoundError'), /no se encontr/i);
  assert.match(cameraErrorMessage('OverconstrainedError'), /no se encontr/i);
});

test('error desconocido conserva el nombre técnico', () => {
  assert.match(cameraErrorMessage('RareError'), /RareError/);
});

test('se reintenta solo cuando la cámara puede liberarse', () => {
  assert.equal(shouldRetry('NotReadableError'), true);
  assert.equal(shouldRetry('AbortError'), true);
  assert.equal(shouldRetry('NotAllowedError'), false);
  assert.equal(shouldRetry('NotFoundError'), false);
});

test('si el dispositivo guardado ya no existe se usa la cámara predeterminada', () => {
  assert.equal(shouldFallBackToDefault('OverconstrainedError'), true);
  assert.equal(shouldFallBackToDefault('NotFoundError'), true);
  assert.equal(shouldFallBackToDefault('NotReadableError'), false);
});
