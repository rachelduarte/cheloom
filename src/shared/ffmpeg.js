// Interpretación de la salida de FFmpeg y armado de los argumentos de exportación. Lógica pura.

// Lee `ffmpeg -i archivo` (stderr): duración, tamaño, fps y si hay audio.
export function parseProbe(text) {
  const d = text.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : null;
  const videoLine = text.match(/Stream #\S+.*?: Video: (.*)/)?.[1] ?? '';
  const size = videoLine.match(/\b(\d{2,5})x(\d{2,5})\b/);
  const fps = videoLine.match(/([\d.]+) fps/) ?? videoLine.match(/([\d.]+) tbr/);
  return {
    duration,
    width: size ? Number(size[1]) : null,
    height: size ? Number(size[2]) : null,
    fps: fps ? Number(fps[1]) : null,
    hasAudio: /Stream #\S+.*?: Audio:/.test(text),
  };
}

// Las grabaciones tienen cuadros variables; se exporta a un ritmo fijo de 30 o 60.
export function outputFps(sourceFps) {
  return sourceFps && sourceFps <= 30 ? 30 : 60;
}

// Lee un bloque de `-progress pipe:1`.
export function parseProgress(chunk) {
  const times = [...chunk.matchAll(/out_time_us=(\S+)/g)];
  const last = times.at(-1)?.[1];
  const us = last && /^\d+$/.test(last) ? Number(last) : null;
  return { seconds: us === null ? null : us / 1e6, done: /progress=end/.test(chunk) };
}

const ms = (n) => Number(n.toFixed(3));

export function buildExportArgs({ input, output, clips, hasAudio, fps }) {
  const parts = [];
  const pads = [];
  clips.forEach((c, i) => {
    const range = `start=${ms(c.start)}:end=${ms(c.end)}`;
    parts.push(`[0:v]trim=${range},setpts=PTS-STARTPTS[v${i}]`);
    pads.push(`[v${i}]`);
    if (hasAudio) {
      parts.push(`[0:a]atrim=${range},asetpts=PTS-STARTPTS[a${i}]`);
      pads.push(`[a${i}]`);
    }
  });
  const outs = hasAudio ? '[outv][outa]' : '[outv]';
  const graph = `${parts.join(';')};${pads.join('')}concat=n=${clips.length}:v=1:a=${hasAudio ? 1 : 0}${outs}`;

  return [
    '-hide_banner',
    '-y',
    '-i',
    input,
    '-filter_complex',
    graph,
    '-map',
    '[outv]',
    ...(hasAudio ? ['-map', '[outa]'] : []),
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '18',
    '-pix_fmt',
    'yuv420p',
    '-fps_mode',
    'cfr',
    '-r',
    String(fps),
    ...(hasAudio ? ['-c:a', 'aac', '-b:a', '192k'] : []),
    '-movflags',
    '+faststart',
    '-progress',
    'pipe:1',
    '-nostats',
    '-f',
    'mp4',
    output,
  ];
}

export function editedFileName(sourceName, exists) {
  const base = sourceName.replace(/\.[^.]+$/, '');
  for (let n = 1; ; n++) {
    const name = `${base} (editado${n > 1 ? ` ${n}` : ''}).mp4`;
    if (!exists(name)) return name;
  }
}
