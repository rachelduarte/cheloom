// Puente mínimo entre los renderers y main. Nada de Node en las páginas.
const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (cb) => {
  const listener = (_e, payload) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
};

contextBridge.exposeInMainWorld('cheloom', {
  // Fuentes y preferencias
  getSources: () => ipcRenderer.invoke('sources:list'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),

  // Cámara
  setCamera: (config) => ipcRenderer.invoke('camera:config', config),
  onCameraConfig: on('camera:config'),
  onCameraShape: on('camera:shape'),
  requestShape: (shape) => ipcRenderer.send('camera:shape-request', shape),
  onShapeRequest: on('camera:shape-request'),
  resizeCamera: (width) => ipcRenderer.send('camera:resize', width),
  moveCamera: (pos) => ipcRenderer.send('camera:move', pos),

  // Grabación
  startRecording: (opts) => ipcRenderer.invoke('rec:start', opts),
  countdownDone: () => ipcRenderer.send('countdown:done'),
  countdownCancel: () => ipcRenderer.send('countdown:cancel'),
  onGo: on('rec:go'),
  onCancelled: on('rec:cancelled'),
  recBegin: () => ipcRenderer.invoke('rec:begin'),
  recChunk: (buf) => ipcRenderer.send('rec:chunk', buf),
  recFinish: () => ipcRenderer.invoke('rec:finish'),
  recDiscard: () => ipcRenderer.invoke('rec:discard'),
  recAbort: () => ipcRenderer.send('rec:abort'),
  sendCommand: (cmd) => ipcRenderer.send('rec:command', cmd),
  onCommand: on('rec:command'),
  sendStatus: (status) => ipcRenderer.send('rec:status', status),
  onStatus: on('rec:status'),

  // Biblioteca
  listRecordings: () => ipcRenderer.invoke('library:list'),
  trash: (file) => ipcRenderer.invoke('library:trash', file),
  showInFolder: (file) => ipcRenderer.send('library:show', file),
  openFolder: () => ipcRenderer.send('library:open-folder'),
});
