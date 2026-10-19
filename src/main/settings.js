// Preferencias de la usuaria en userData/settings.json.
import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULTS = {
  shape: 'bubble',
  cameraId: null,
  micId: null,
  mirror: true,
  quality: 'youtube',
  cameraWidth: 240,
  cameraPosition: null,
};

const file = () => path.join(app.getPath('userData'), 'settings.json');
let cache = null;

export function getSettings() {
  if (!cache) {
    try {
      cache = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(file(), 'utf8')) };
    } catch {
      cache = { ...DEFAULTS };
    }
  }
  return cache;
}

export function setSettings(patch) {
  cache = { ...getSettings(), ...patch };
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(cache, null, 2));
  return cache;
}
