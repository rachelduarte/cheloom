// Presets de calidad de grabación. Lógica pura: el renderer le pasa MediaRecorder.isTypeSupported.

export const PRESETS = {
  youtube: {
    label: 'YouTube (recomendado)',
    fps: 60,
    videoBitsPerSecond: 24_000_000,
    audioBitsPerSecond: 192_000,
    prefer: 'mp4',
  },
  max: {
    label: 'Máxima',
    fps: 60,
    videoBitsPerSecond: 40_000_000,
    audioBitsPerSecond: 256_000,
    prefer: 'mp4',
  },
  light: {
    label: 'Liviana (compartir rápido)',
    fps: 30,
    videoBitsPerSecond: 8_000_000,
    audioBitsPerSecond: 128_000,
    prefer: 'webm',
  },
};

export const DEFAULT_PRESET = 'youtube';

export function presetFor(id) {
  return PRESETS[id] ?? PRESETS[DEFAULT_PRESET];
}

// H.264 High 5.1 cubre hasta 4K a 60 fps; mp4a.40.2 es AAC-LC.
const FORMATS = {
  mp4: {
    ext: 'mp4',
    label: 'MP4 · H.264',
    withAudio: ['video/mp4;codecs=avc1.640033,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc1,opus'],
    videoOnly: ['video/mp4;codecs=avc1.640033', 'video/mp4;codecs=avc1'],
  },
  webm: {
    ext: 'webm',
    label: 'WebM · VP9',
    withAudio: ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus'],
    videoOnly: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8'],
  },
};

export function pickFormat(preset, isTypeSupported, hasAudio) {
  const order = preset.prefer === 'mp4' ? ['mp4', 'webm'] : ['webm', 'mp4'];
  for (const key of order) {
    const format = FORMATS[key];
    const mimeType = (hasAudio ? format.withAudio : format.videoOnly).find((t) => isTypeSupported(t));
    if (mimeType) return { mimeType, ext: format.ext, label: format.label };
  }
  return { mimeType: '', ext: 'webm', label: 'WebM' };
}
