import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProbe, parseProgress, buildExportArgs, outputFps, editedFileName } from '../src/shared/ffmpeg.js';

// Salidas reales de `ffmpeg -i` sobre grabaciones de CHELOOM (2026-10-19).
const MP4_PROBE = `Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'CHELOOM 2026-10-19 10-14-55.mp4':
  Duration: 00:00:13.99, start: 0.000000, bitrate: 1155 kb/s
  Stream #0:0[0x1](und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, mono, fltp, 192 kb/s (default)
  Stream #0:1[0x2](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, smpte170m, progressive), 2560x1440, 961 kb/s, SAR 1:1 DAR 16:9, 35.72 fps, 60k tbr, 60k tbn (default)
At least one output file must be specified`;

const WEBM_RAW_PROBE = `  Duration: N/A, start: 0.000000, bitrate: N/A
  Stream #0:0(eng): Audio: opus, 48000 Hz, mono, fltp (default)
  Stream #0:1(eng): Video: vp9 (Profile 0), yuv420p(tv, smpte170m/unknown/unknown), 2560x1440, SAR 1:1 DAR 16:9, 28.92 tbr, 1k tbn (default)`;

const VIDEO_ONLY_PROBE = `  Duration: 01:02:03.50, start: 0.000000, bitrate: 900 kb/s
  Stream #0:0(und): Video: h264 (High), yuv420p, 1920x1080, 30 fps, 30 tbr, 15360 tbn (default)`;

test('parseProbe lee duración, tamaño, fps y audio de un MP4 real', () => {
  assert.deepEqual(parseProbe(MP4_PROBE), { duration: 13.99, width: 2560, height: 1440, fps: 35.72, hasAudio: true });
});

test('parseProbe: WebM sin remux no tiene duración y usa tbr como fps', () => {
  assert.deepEqual(parseProbe(WEBM_RAW_PROBE), { duration: null, width: 2560, height: 1440, fps: 28.92, hasAudio: true });
});

test('parseProbe: horas y video sin audio', () => {
  const p = parseProbe(VIDEO_ONLY_PROBE);
  assert.equal(p.duration, 3723.5);
  assert.equal(p.hasAudio, false);
  assert.equal(p.fps, 30);
});

test('outputFps: 60 si el original pasa de 30, si no 30', () => {
  assert.equal(outputFps(35.72), 60);
  assert.equal(outputFps(28.92), 30);
  assert.equal(outputFps(30), 30);
  assert.equal(outputFps(null), 60);
});

test('parseProgress lee el tiempo exportado de -progress', () => {
  const chunk = 'frame=120\nfps=40.1\nout_time_us=4000000\nout_time=00:00:04.000000\nprogress=continue\n';
  assert.deepEqual(parseProgress(chunk), { seconds: 4, done: false });
  assert.deepEqual(parseProgress('out_time_us=10000000\nprogress=end\n'), { seconds: 10, done: true });
  assert.deepEqual(parseProgress('out_time_us=N/A\nprogress=continue\n'), { seconds: null, done: false });
});

test('buildExportArgs arma trim/atrim + concat con los fragmentos en orden', () => {
  const args = buildExportArgs({
    input: 'in.mp4',
    output: 'out.mp4.part',
    clips: [
      { start: 1, end: 5 },
      { start: 10, end: 16 },
    ],
    hasAudio: true,
    fps: 60,
  });
  const graph = args[args.indexOf('-filter_complex') + 1];
  assert.equal(
    graph,
    '[0:v]trim=start=1:end=5,setpts=PTS-STARTPTS[v0];[0:a]atrim=start=1:end=5,asetpts=PTS-STARTPTS[a0];' +
      '[0:v]trim=start=10:end=16,setpts=PTS-STARTPTS[v1];[0:a]atrim=start=10:end=16,asetpts=PTS-STARTPTS[a1];' +
      '[v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]',
  );
  assert.deepEqual(args.slice(0, 4), ['-hide_banner', '-y', '-i', 'in.mp4']);
  for (const flag of ['-map', '[outv]', '[outa]', 'libx264', 'aac', '+faststart', 'cfr', 'yuv420p'])
    assert.ok(args.includes(flag), `falta ${flag}`);
  assert.equal(args[args.indexOf('-r') + 1], '60');
  assert.equal(args[args.indexOf('-f') + 1], 'mp4'); // el .part no dice el formato
  assert.equal(args.at(-1), 'out.mp4.part');
  assert.ok(args.includes('-progress'));
});

test('buildExportArgs sin audio no toca pistas de audio', () => {
  const args = buildExportArgs({ input: 'in.mp4', output: 'o.part', clips: [{ start: 0, end: 3 }], hasAudio: false, fps: 30 });
  const graph = args[args.indexOf('-filter_complex') + 1];
  assert.equal(graph, '[0:v]trim=start=0:end=3,setpts=PTS-STARTPTS[v0];[v0]concat=n=1:v=1:a=0[outv]');
  assert.ok(!args.includes('[outa]'));
  assert.ok(!args.includes('aac'));
});

test('buildExportArgs redondea tiempos a milisegundos', () => {
  const args = buildExportArgs({
    input: 'i',
    output: 'o',
    clips: [{ start: 1.23456789, end: 2.5 }],
    hasAudio: false,
    fps: 30,
  });
  assert.match(args[args.indexOf('-filter_complex') + 1], /trim=start=1\.235:end=2\.5,/);
});

test('editedFileName agrega "(editado)" y numera si ya existe', () => {
  const exists = (n) => ['CHELOOM 2026-10-19 10-14-55 (editado).mp4'].includes(n);
  assert.equal(editedFileName('CHELOOM 2026-10-19 09-52-27.webm', () => false), 'CHELOOM 2026-10-19 09-52-27 (editado).mp4');
  assert.equal(editedFileName('CHELOOM 2026-10-19 10-14-55.mp4', exists), 'CHELOOM 2026-10-19 10-14-55 (editado 2).mp4');
});
