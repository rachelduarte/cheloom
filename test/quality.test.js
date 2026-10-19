import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, DEFAULT_PRESET, presetFor, pickFormat } from '../src/shared/quality.js';

const all = () => true;
const only = (...types) => (t) => types.includes(t);

test('tres presets y YouTube por defecto', () => {
  assert.deepEqual(Object.keys(PRESETS), ['youtube', 'max', 'light']);
  assert.equal(DEFAULT_PRESET, 'youtube');
});

test('YouTube: 60 fps y 24 Mbps; Máxima: 60 fps y 40 Mbps; Liviana: 30 fps y 8 Mbps', () => {
  assert.equal(PRESETS.youtube.fps, 60);
  assert.equal(PRESETS.youtube.videoBitsPerSecond, 24_000_000);
  assert.equal(PRESETS.max.fps, 60);
  assert.equal(PRESETS.max.videoBitsPerSecond, 40_000_000);
  assert.equal(PRESETS.light.fps, 30);
  assert.equal(PRESETS.light.videoBitsPerSecond, 8_000_000);
});

test('un preset desconocido cae en YouTube', () => {
  assert.equal(presetFor('8k'), PRESETS.youtube);
});

test('YouTube con audio prefiere MP4 H.264 + AAC', () => {
  const f = pickFormat(PRESETS.youtube, all, true);
  assert.equal(f.ext, 'mp4');
  assert.match(f.mimeType, /^video\/mp4;codecs=avc1/);
  assert.match(f.mimeType, /mp4a\.40\.2/);
  assert.equal(f.label, 'MP4 · H.264');
});

test('YouTube sin audio pide MP4 solo con video', () => {
  const f = pickFormat(PRESETS.youtube, all, false);
  assert.equal(f.ext, 'mp4');
  assert.doesNotMatch(f.mimeType, /mp4a|opus/);
});

test('sin soporte MP4 cae a WebM VP9', () => {
  const f = pickFormat(PRESETS.youtube, only('video/webm;codecs=vp9,opus'), true);
  assert.equal(f.ext, 'webm');
  assert.equal(f.mimeType, 'video/webm;codecs=vp9,opus');
  assert.equal(f.label, 'WebM · VP9');
});

test('Liviana prefiere WebM VP9', () => {
  assert.equal(pickFormat(PRESETS.light, all, true).ext, 'webm');
});

test('sin ningún tipo conocido usa el predeterminado del navegador en WebM', () => {
  const f = pickFormat(PRESETS.youtube, () => false, true);
  assert.deepEqual(f, { mimeType: '', ext: 'webm', label: 'WebM' });
});
