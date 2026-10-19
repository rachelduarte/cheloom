// Editor de video: prepara la grabación (remux + miniaturas) y exporta los fragmentos pegados con FFmpeg.
import { app, ipcMain } from 'electron';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ffmpegStatic from 'ffmpeg-static';
import { buildExportArgs, editedFileName, outputFps, parseProbe, parseProgress } from '../shared/ffmpeg.js';
import { insideLibrary } from './library.js';
import { recordingsDir } from './recorder-file.js';

// Un ejecutable no puede correr desde dentro del asar: en la app instalada vive en app.asar.unpacked.
const FFMPEG = ffmpegStatic.replace(`app.asar${path.sep}`, `app.asar.unpacked${path.sep}`);
const STRIP_HEIGHT = 72;

let session = null; // { source, proxy, dir, probe, child, cancelled }

// track: guarda el proceso para poder cancelarlo (solo la exportación).
function run(args, onStdout, track = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, args, { windowsHide: true });
    if (track && session) session.child = child;
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr = (stderr + d).slice(-20_000);
    });
    child.stdout.on('data', (d) => onStdout?.(String(d)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (track && session?.child === child) session.child = null;
      resolve({ code, stderr });
    });
  });
}

const lastLines = (text, n = 4) => text.trim().split(/\r?\n/).slice(-n).join('\n');

async function cleanup() {
  const s = session;
  session = null;
  if (!s) return;
  s.child?.kill();
  await fs.promises.rm(s.dir, { recursive: true, force: true }).catch(() => {});
}

export async function prepare(source, sendStrip) {
  if (!insideLibrary(source)) throw new Error('El archivo no está en la biblioteca de CHELOOM.');
  await cleanup();
  const dir = await fs.promises.mkdtemp(path.join(app.getPath('temp'), 'cheloom-editor-'));
  const proxy = path.join(dir, `proxy${path.extname(source).toLowerCase()}`);
  session = { source, proxy, dir, probe: null, child: null, cancelled: false };
  const mine = session;

  // Remux sin recomprimir: deja el archivo indexado (el WebM de MediaRecorder no trae duración).
  const remux = await run(['-hide_banner', '-y', '-i', source, '-c', 'copy', '-movflags', '+faststart', proxy]);
  if (remux.code !== 0) throw new Error(`No se pudo abrir el video:\n${lastLines(remux.stderr)}`);

  const info = parseProbe((await run(['-hide_banner', '-i', proxy])).stderr);
  if (!info.duration) throw new Error('No se pudo leer la duración del video.');
  mine.probe = info;

  // Miniaturas en segundo plano: una tira con un cuadro cada tanto, solo de cuadros clave (rápido).
  const tiles = Math.min(120, Math.max(8, Math.round(info.duration)));
  const strip = path.join(dir, 'strip.jpg');
  run([
    '-hide_banner',
    '-y',
    '-skip_frame',
    'nokey',
    '-i',
    proxy,
    '-vf',
    `fps=${tiles / info.duration},scale=-2:${STRIP_HEIGHT},tile=${tiles}x1`,
    '-frames:v',
    '1',
    '-q:v',
    '4',
    strip,
  ]).then((r) => {
    if (session === mine && r.code === 0 && fs.existsSync(strip)) sendStrip({ url: pathToFileURL(strip).href, tiles });
  });

  return { name: path.basename(source), url: pathToFileURL(proxy).href, ...info };
}

export async function exportVideo(clips, onProgress) {
  const s = session;
  if (!s?.probe) throw new Error('No hay ningún video abierto en el editor.');
  const dir = recordingsDir();
  const output = path.join(dir, editedFileName(path.basename(s.source), (n) => fs.existsSync(path.join(dir, n))));
  const part = `${output}.part`;
  const total = clips.reduce((sum, c) => sum + (c.end - c.start), 0);
  s.cancelled = false;

  const args = buildExportArgs({ input: s.proxy, output: part, clips, hasAudio: s.probe.hasAudio, fps: outputFps(s.probe.fps) });
  const result = await run(
    args,
    (chunk) => {
      const p = parseProgress(chunk);
      if (p.seconds !== null) onProgress(Math.min(1, p.seconds / total));
    },
    true,
  );

  if (s.cancelled || result.code !== 0) {
    await fs.promises.rm(part, { force: true });
    if (s.cancelled) return null;
    throw new Error(`FFmpeg no pudo exportar el video:\n${lastLines(result.stderr)}`);
  }
  await fs.promises.rename(part, output);
  return output;
}

export function cancelExport() {
  if (!session?.child) return;
  session.cancelled = true;
  session.child.kill();
}

export function registerEditorIpc({ onLibraryChanged }) {
  ipcMain.handle('editor:prepare', (e, file) =>
    prepare(file, (strip) => {
      if (!e.sender.isDestroyed()) e.sender.send('editor:strip', strip);
    }),
  );
  ipcMain.handle('editor:export', async (e, clips) => {
    const file = await exportVideo(clips, (ratio) => {
      if (!e.sender.isDestroyed()) e.sender.send('editor:progress', ratio);
    });
    if (file) onLibraryChanged(file);
    return file;
  });
  ipcMain.on('editor:cancel', () => cancelExport());
}

export const closeEditorSession = cleanup;
