// Ventanas de CHELOOM: panel, cámara flotante, barra de grabación y cuenta regresiva.
import { BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { clampSize, sizeFor } from '../shared/shapes.js';
import { getSettings, setSettings } from './settings.js';

const root = path.join(import.meta.dirname, '..');
const preload = path.join(root, 'preload', 'index.cjs');
const page = (name) => path.join(root, 'renderer', name, 'index.html');

export const win = { panel: null, camera: null, toolbar: null, countdown: null };

const floating = {
  frame: false,
  transparent: true,
  resizable: false,
  maximizable: false,
  minimizable: false,
  fullscreenable: false,
  skipTaskbar: true,
  hasShadow: false,
  alwaysOnTop: true,
  show: false,
};

function webPreferences(extra = {}) {
  return { preload, contextIsolation: true, nodeIntegration: false, sandbox: true, ...extra };
}

function keepOnTop(w) {
  w.setAlwaysOnTop(true, 'screen-saver');
  w.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

export function createPanel() {
  win.panel = new BrowserWindow({
    width: 1120,
    height: 720,
    minWidth: 880,
    minHeight: 600,
    title: 'CHELOOM',
    icon: path.join(root, 'assets', 'icon.png'),
    backgroundColor: '#0A0F0F',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0C152A', symbolColor: '#C9DEE8', height: 44 },
    show: false,
    // El MediaRecorder vive aquí y sigue grabando con el panel oculto.
    webPreferences: webPreferences({ backgroundThrottling: false }),
  });
  win.panel.loadFile(page('panel'));
  win.panel.once('ready-to-show', () => win.panel.show());
  win.panel.on('closed', () => {
    win.panel = null;
    for (const key of ['camera', 'toolbar', 'countdown']) win[key]?.destroy();
  });
  return win.panel;
}

// ── Cámara flotante ────────────────────────────────────────────────

function defaultCameraBounds(size) {
  const { workArea } = screen.getPrimaryDisplay();
  return { x: workArea.x + 32, y: workArea.y + workArea.height - size.height - 32, ...size };
}

function saveCameraBounds() {
  if (!win.camera) return;
  const b = win.camera.getBounds();
  setSettings({ cameraWidth: b.width, cameraPosition: { x: b.x, y: b.y } });
}

export function applyCamera({ deviceId, shape, mirror }) {
  if (!deviceId) {
    win.camera?.destroy();
    return;
  }
  const settings = getSettings();
  const size = clampSize(shape, settings.cameraWidth);

  if (!win.camera) {
    const pos = settings.cameraPosition;
    const bounds = pos ? { ...pos, ...size } : defaultCameraBounds(size);
    win.camera = new BrowserWindow({ ...floating, ...bounds, title: 'CHELOOM · Cámara', webPreferences: webPreferences() });
    keepOnTop(win.camera);
    win.camera.loadFile(page('camera'));
    win.camera.once('ready-to-show', () => win.camera.showInactive());
    win.camera.on('moved', saveCameraBounds);
    win.camera.on('closed', () => (win.camera = null));
    win.camera.webContents.once('did-finish-load', () => win.camera?.webContents.send('camera:config', { deviceId, shape, mirror }));
    return;
  }

  // Cambio de forma: conservar el área y anclar la esquina inferior izquierda.
  const old = win.camera.getBounds();
  const next = sizeFor(shape, old.width * old.height);
  win.camera.setBounds({ x: old.x, y: old.y + old.height - next.height, ...next });
  saveCameraBounds();
  win.camera.webContents.send('camera:config', { deviceId, shape, mirror });
}

// Arrastre manual: en Windows las zonas -webkit-app-region no reciben hover y los controles no aparecerían.
export function moveCamera({ x, y, done }) {
  if (!win.camera) return;
  win.camera.setPosition(Math.round(x), Math.round(y));
  if (done) saveCameraBounds();
}

export function resizeCamera(width) {
  if (!win.camera) return;
  const { x, y } = win.camera.getBounds();
  win.camera.setBounds({ x, y, ...clampSize(getSettings().shape, width) });
  saveCameraBounds();
}

// ── Barra de grabación ─────────────────────────────────────────────

export function openToolbar() {
  const { workArea } = screen.getPrimaryDisplay();
  const width = 340;
  const height = 64;
  win.toolbar = new BrowserWindow({
    ...floating,
    width,
    height,
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: workArea.y + workArea.height - height - 24,
    title: 'CHELOOM · Grabando',
    webPreferences: webPreferences(),
  });
  win.toolbar.setContentProtection(true); // Windows la excluye del video
  keepOnTop(win.toolbar);
  win.toolbar.loadFile(page('toolbar'));
  win.toolbar.once('ready-to-show', () => win.toolbar.showInactive());
  win.toolbar.on('closed', () => (win.toolbar = null));
}

export function closeToolbar() {
  win.toolbar?.destroy();
}

// ── Cuenta regresiva ───────────────────────────────────────────────

export function openCountdown() {
  const { workArea } = screen.getPrimaryDisplay();
  const size = 240;
  win.countdown = new BrowserWindow({
    ...floating,
    width: size,
    height: size,
    x: Math.round(workArea.x + (workArea.width - size) / 2),
    y: Math.round(workArea.y + (workArea.height - size) / 2),
    title: 'CHELOOM · Preparando',
    webPreferences: webPreferences(),
  });
  win.countdown.setContentProtection(true);
  keepOnTop(win.countdown);
  win.countdown.loadFile(page('countdown'));
  win.countdown.once('ready-to-show', () => {
    win.countdown.show();
    win.countdown.focus(); // para recibir Esc
  });
  win.countdown.on('closed', () => (win.countdown = null));
}

export function closeCountdown() {
  win.countdown?.destroy();
}
