import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, recordingFileName, formatBytes } from '../src/shared/format.js';

test('formatDuration en m:ss y h:mm:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(65_400), '1:05');
  assert.equal(formatDuration(3_725_000), '1:02:05');
});

test('formatDuration nunca es negativo', () => {
  assert.equal(formatDuration(-10), '0:00');
});

test('recordingFileName usa fecha y hora locales, sin caracteres prohibidos en Windows', () => {
  const name = recordingFileName(new Date(2026, 9, 19, 14, 5, 9));
  assert.equal(name, 'CHELOOM 2026-10-19 14-05-09.webm');
  assert.doesNotMatch(name, /[<>:"/\|?*]/);
});

test('recordingFileName usa la extensión del contenedor', () => {
  assert.equal(recordingFileName(new Date(2026, 9, 19, 14, 5, 9), 'mp4'), 'CHELOOM 2026-10-19 14-05-09.mp4');
});

test('formatBytes legible', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(12.3 * 1024 * 1024), '12.3 MB');
});
