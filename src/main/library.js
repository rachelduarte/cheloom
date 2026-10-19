// Biblioteca local: lista las grabaciones, las manda a la Papelera y abre el Explorador.
import { shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { recordingsDir } from './recorder-file.js';

function insideLibrary(file) {
  const rel = path.relative(recordingsDir(), path.resolve(file));
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export async function list() {
  fs.mkdirSync(recordingsDir(), { recursive: true });
  const names = (await fs.promises.readdir(recordingsDir())).filter((n) => n.toLowerCase().endsWith('.webm'));
  const items = await Promise.all(
    names.map(async (name) => {
      const file = path.join(recordingsDir(), name);
      const stat = await fs.promises.stat(file);
      return { path: file, url: pathToFileURL(file).href, name, size: stat.size, mtime: stat.mtimeMs };
    }),
  );
  return items.sort((a, b) => b.mtime - a.mtime);
}

export async function trash(file) {
  if (!insideLibrary(file)) throw new Error('El archivo no está en la biblioteca de CHELOOM.');
  await shell.trashItem(file);
}

export function showInFolder(file) {
  if (insideLibrary(file)) shell.showItemInFolder(file);
}

export function openFolder() {
  fs.mkdirSync(recordingsDir(), { recursive: true });
  return shell.openPath(recordingsDir());
}
