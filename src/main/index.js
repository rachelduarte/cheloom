// Punto de entrada del proceso main de cheloom.
import { app, desktopCapturer, session } from 'electron';
import { registerIpc, state } from './ipc.js';
import * as recorder from './recorder-file.js';
import { createPanel, win } from './windows.js';

if (!app.requestSingleInstanceLock()) app.quit();

app.on('second-instance', () => {
  win.panel?.show();
  win.panel?.focus();
});

app.whenReady().then(() => {
  app.setAppUserModelId('pe.cheloom.app');

  // Cámara, micrófono y pantalla: la app es local, se conceden sin preguntar en cada ventana.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(['media', 'display-capture'].includes(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => ['media', 'display-capture'].includes(permission));

  // getDisplayMedia() en el panel recibe la fuente que la usuaria eligió.
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
    const source = sources.find((s) => s.id === state.sourceId) ?? sources.find((s) => s.id.startsWith('screen:'));
    callback(source ? { video: source } : {});
  });

  registerIpc();
  createPanel();
});

// Si se cierra la app grabando, se conserva lo grabado como .webm.
let finishing = false;
app.on('before-quit', async (event) => {
  if (!recorder.isRecording() || finishing) return;
  event.preventDefault();
  finishing = true;
  await recorder.finish();
  app.quit();
});

app.on('window-all-closed', () => app.quit());
