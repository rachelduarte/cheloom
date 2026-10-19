// Canales IPC entre renderers y main.
import { desktopCapturer, dialog, ipcMain, screen } from 'electron';
import * as library from './library.js';
import * as recorder from './recorder-file.js';
import { getSettings, setSettings } from './settings.js';
import {
  applyCamera,
  closeCountdown,
  closeToolbar,
  moveCamera,
  openCountdown,
  openToolbar,
  resizeCamera,
  win,
} from './windows.js';

export const state = { sourceId: null, lastStatus: null };

function backToPanel() {
  closeToolbar();
  closeCountdown();
  win.panel?.show();
  win.panel?.focus();
}

async function confirm(parent, message, detail, ok) {
  const { response } = await dialog.showMessageBox(parent, {
    type: 'warning',
    buttons: [ok, 'Cancelar'],
    defaultId: 1,
    cancelId: 1,
    message,
    detail,
  });
  return response === 0;
}

export function registerIpc() {
  // Fuentes de captura
  ipcMain.handle('sources:list', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
    });
    const displays = screen.getAllDisplays();
    return sources
      .filter((s) => !s.name.startsWith('CHELOOM'))
      .map((s) => {
        // Tamaño físico de la pantalla, para capturar sin reescalar.
        const d = displays.find((x) => String(x.id) === s.display_id);
        const size = d
          ? { width: Math.round(d.size.width * d.scaleFactor), height: Math.round(d.size.height * d.scaleFactor) }
          : null;
        return { id: s.id, name: s.name, thumbnail: s.thumbnail.toDataURL(), isScreen: s.id.startsWith('screen:'), size };
      });
  });

  // Preferencias
  ipcMain.handle('settings:get', () => getSettings());
  ipcMain.handle('settings:set', (_e, patch) => setSettings(patch));

  // Cámara flotante
  ipcMain.handle('camera:config', (_e, config) => {
    setSettings({
      cameraId: config.deviceId,
      shape: config.shape,
      mirror: config.mirror,
      frame: config.frame,
      frameColor: config.frameColor,
    });
    applyCamera(config);
    win.panel?.webContents.send('camera:shape', config.shape);
  });
  ipcMain.on('camera:resize', (_e, width) => resizeCamera(width));
  ipcMain.on('camera:move', (_e, pos) => moveCamera(pos));
  // Cambio de forma pedido desde la propia cámara: el panel decide y vuelve a configurar.
  ipcMain.on('camera:shape-request', (_e, shape) => win.panel?.webContents.send('camera:shape-request', shape));

  // Flujo de grabación
  ipcMain.handle('rec:start', (_e, { sourceId }) => {
    state.sourceId = sourceId;
    state.lastStatus = null;
    win.panel?.hide();
    openCountdown();
  });
  ipcMain.on('countdown:done', () => {
    closeCountdown();
    openToolbar();
    // La barra puede terminar de cargar después del primer estado: se lo reenviamos.
    win.toolbar.webContents.once('did-finish-load', () => {
      if (state.lastStatus) win.toolbar?.webContents.send('rec:status', state.lastStatus);
    });
    win.panel?.webContents.send('rec:go');
  });
  ipcMain.on('countdown:cancel', () => {
    backToPanel();
    win.panel?.webContents.send('rec:cancelled');
  });
  ipcMain.handle('rec:begin', (_e, { ext }) => recorder.begin(ext === 'mp4' ? 'mp4' : 'webm'));
  ipcMain.on('rec:chunk', (_e, buf) => recorder.append(buf));
  ipcMain.handle('rec:finish', async () => {
    const file = await recorder.finish();
    backToPanel();
    return file;
  });
  ipcMain.handle('rec:discard', async () => {
    await recorder.discard();
    backToPanel();
  });
  ipcMain.on('rec:abort', () => backToPanel());

  // Barra ↔ panel
  ipcMain.on('rec:command', async (_e, cmd) => {
    if (cmd === 'discard') {
      const ok = await confirm(win.toolbar, '¿Descartar esta grabación?', 'Se borrará lo grabado hasta ahora.', 'Descartar');
      if (!ok) return;
    }
    win.panel?.webContents.send('rec:command', cmd);
  });
  ipcMain.on('rec:status', (_e, status) => {
    state.lastStatus = status;
    win.toolbar?.webContents.send('rec:status', status);
  });

  // Biblioteca
  ipcMain.handle('library:list', () => library.list());
  ipcMain.handle('library:trash', async (_e, file) => {
    const ok = await confirm(win.panel, '¿Mover a la Papelera?', file, 'Mover a la Papelera');
    if (ok) await library.trash(file);
    return ok;
  });
  ipcMain.on('library:show', (_e, file) => library.showInFolder(file));
  ipcMain.on('library:open-folder', () => library.openFolder());
}
