// Escribe la grabación a disco en fragmentos: *.webm.part mientras graba, *.webm al terminar.
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { recordingFileName } from '../shared/format.js';

export const recordingsDir = () => path.join(app.getPath('videos'), 'cheloom');

let current = null; // { stream, partPath, finalPath }

export function isRecording() {
  return current !== null;
}

export function begin(ext = 'webm') {
  if (current) discard();
  fs.mkdirSync(recordingsDir(), { recursive: true });
  const finalPath = path.join(recordingsDir(), recordingFileName(new Date(), ext));
  const partPath = `${finalPath}.part`;
  current = { stream: fs.createWriteStream(partPath), partPath, finalPath };
  return finalPath;
}

export function append(arrayBuffer) {
  current?.stream.write(Buffer.from(arrayBuffer));
}

function close() {
  const rec = current;
  current = null;
  return new Promise((resolve) => rec.stream.end(() => resolve(rec)));
}

export async function finish() {
  if (!current) return null;
  const rec = await close();
  await fs.promises.rename(rec.partPath, rec.finalPath);
  return rec.finalPath;
}

export async function discard() {
  if (!current) return;
  const rec = await close();
  await fs.promises.rm(rec.partPath, { force: true });
}
