import { formatBytes } from '../../shared/format.js';
import { DEFAULT_FRAME, FRAMES, frameStyle, isHexColor } from '../../shared/frames.js';
import { PRESETS, pickFormat, presetFor } from '../../shared/quality.js';

const api = window.cheloom;
const $ = (sel) => document.querySelector(sel);

const ui = {
  tabs: document.querySelectorAll('.tab'),
  views: { record: $('#view-record'), library: $('#view-library') },
  segs: document.querySelectorAll('.seg'),
  grid: $('#source-grid'),
  windowWarning: $('#window-warning'),
  camera: $('#camera-select'),
  mic: $('#mic-select'),
  shapes: document.querySelectorAll('.shape'),
  mirror: $('#mirror'),
  frames: $('#frames'),
  frameName: $('#frame-name'),
  frameColor: $('#frame-color'),
  quality: $('#quality-select'),
  qualityInfo: $('#quality-info'),
  message: $('#setup-message'),
  recordBtn: $('#record-btn'),
  recordings: $('#recordings'),
  libEmpty: $('#lib-empty'),
  player: $('#player'),
  placeholder: $('#player-placeholder'),
  meta: $('#player-meta'),
  title: $('#player-title'),
  sub: $('#player-sub'),
};

const state = {
  settings: null,
  sources: [],
  kind: 'screen',
  sourceId: null,
  selectedFile: null,
  frame: DEFAULT_FRAME,
  frameColor: '#ED0180',
};

// ── Utilidades ──────────────────────────────────────

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function showMessage(text, isError = false) {
  ui.message.hidden = !text;
  ui.message.textContent = text ?? '';
  ui.message.classList.toggle('note-error', isError);
}

function switchView(name) {
  for (const tab of ui.tabs) {
    const active = tab.dataset.view === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active);
  }
  for (const [key, view] of Object.entries(ui.views)) view.hidden = key !== name;
  if (name === 'library') refreshLibrary();
  else refreshSources();
}

// ── Fuentes ─────────────────────────────────────────

async function refreshSources() {
  state.sources = await api.getSources();
  renderSources();
}

function renderSources() {
  const list = state.sources.filter((s) => (state.kind === 'screen' ? s.isScreen : !s.isScreen));
  if (!list.some((s) => s.id === state.sourceId)) state.sourceId = list[0]?.id ?? null;

  ui.grid.replaceChildren(
    ...list.map((s, i) => {
      const card = el('button', { className: 'source', title: s.name }, [
        el('img', { src: s.thumbnail, alt: '' }),
        el('span', { textContent: s.isScreen && list.length > 1 ? `Pantalla ${i + 1}` : s.name }),
      ]);
      card.classList.toggle('is-selected', s.id === state.sourceId);
      card.addEventListener('click', () => {
        state.sourceId = s.id;
        renderSources();
      });
      return card;
    }),
  );
  if (!list.length) ui.grid.append(el('p', { className: 'muted', textContent: 'No hay fuentes de este tipo.' }));

  ui.windowWarning.hidden = state.kind === 'screen' || !ui.camera.value;
  ui.recordBtn.disabled = !state.sourceId;
  renderQualityInfo();
}

for (const seg of ui.segs) {
  seg.addEventListener('click', () => {
    state.kind = seg.dataset.kind;
    for (const s of ui.segs) {
      s.classList.toggle('is-active', s === seg);
      s.setAttribute('aria-checked', s === seg);
    }
    renderSources();
  });
}
$('#refresh-sources').addEventListener('click', refreshSources);

// ── Dispositivos ────────────────────────────────────

async function unlockDeviceLabels() {
  // Sin un permiso concedido, enumerateDevices() devuelve dispositivos sin nombre.
  for (const constraints of [{ audio: true, video: true }, { audio: true }, { video: true }]) {
    try {
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      s.getTracks().forEach((t) => t.stop());
      return;
    } catch {
      /* se prueba la siguiente combinación */
    }
  }
}

function fillSelect(select, devices, noneLabel, savedId) {
  const options = [el('option', { value: '', textContent: noneLabel })];
  devices.forEach((d, i) => options.push(el('option', { value: d.deviceId, textContent: d.label || `Dispositivo ${i + 1}` })));
  select.replaceChildren(...options);
  select.value = devices.some((d) => d.deviceId === savedId) ? savedId : (devices[0]?.deviceId ?? '');
}

async function refreshDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cams = devices.filter((d) => d.kind === 'videoinput');
  const mics = devices.filter((d) => d.kind === 'audioinput' && d.deviceId !== 'communications');
  const s = state.settings;
  fillSelect(ui.camera, cams, 'Sin cámara', ui.camera.value || s.cameraId);
  fillSelect(ui.mic, mics, 'Sin micrófono', ui.mic.value || s.micId);
  if (!cams.length && !mics.length) showMessage('No se encontró cámara ni micrófono. Puedes grabar solo la pantalla.');
}

// ── Cámara y forma ──────────────────────────────────

function currentShape() {
  return [...ui.shapes].find((b) => b.classList.contains('is-active'))?.dataset.shape ?? 'bubble';
}

function setShapeButtons(shape) {
  for (const b of ui.shapes) {
    const active = b.dataset.shape === shape;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-checked', active);
  }
}

function applyCamera() {
  api.setCamera({
    deviceId: ui.camera.value || null,
    shape: currentShape(),
    mirror: ui.mirror.checked,
    frame: state.frame,
    frameColor: state.frameColor,
  });
  renderSources();
}

// ── Color del marco ─────────────────────────────────

function renderFrames() {
  ui.frames.replaceChildren(
    ...Object.entries(FRAMES).map(([id, f]) => {
      const swatch = el('button', { className: `swatch ${id}`, title: f.label });
      swatch.setAttribute('role', 'radio');
      swatch.setAttribute('aria-label', f.label);
      swatch.setAttribute('aria-checked', id === state.frame);
      swatch.classList.toggle('is-active', id === state.frame);
      if (id === 'custom') swatch.style.background = state.frameColor;
      else if (id !== 'none') swatch.style.background = frameStyle(id).background;
      swatch.addEventListener('click', () => {
        if (id === 'custom') {
          ui.frameColor.value = state.frameColor.toLowerCase();
          ui.frameColor.click(); // abre el selector de color de Windows
        }
        setFrame(id);
      });
      return swatch;
    }),
  );
  ui.frameName.textContent = state.frame === 'custom' ? state.frameColor.toUpperCase() : FRAMES[state.frame].label;
}

function setFrame(id, color = state.frameColor) {
  state.frame = FRAMES[id] ? id : DEFAULT_FRAME;
  state.frameColor = isHexColor(color) ? color : state.frameColor;
  renderFrames();
  applyCamera();
}

ui.frameColor.addEventListener('input', () => setFrame('custom', ui.frameColor.value));

for (const b of ui.shapes) {
  b.addEventListener('click', () => {
    setShapeButtons(b.dataset.shape);
    applyCamera();
  });
}
api.onShapeRequest((shape) => {
  setShapeButtons(shape);
  applyCamera();
});
ui.camera.addEventListener('change', applyCamera);
ui.mirror.addEventListener('change', applyCamera);
ui.mic.addEventListener('change', () => {
  api.setSettings({ micId: ui.mic.value || null });
  renderQualityInfo();
});

// ── Calidad ─────────────────────────────────────────

const isTypeSupported = (t) => MediaRecorder.isTypeSupported(t);

function selectedSource() {
  return state.sources.find((s) => s.id === state.sourceId);
}

function renderQualityInfo() {
  const preset = presetFor(ui.quality.value);
  const format = pickFormat(preset, isTypeSupported, Boolean(ui.mic.value));
  const size = selectedSource()?.size;
  const res = size ? `${size.height}p` : 'tamaño de la ventana';
  ui.qualityInfo.textContent = `${format.label} · ${res} · ${preset.fps} fps · ${preset.videoBitsPerSecond / 1e6} Mbps`;
}

ui.quality.replaceChildren(...Object.entries(PRESETS).map(([id, p]) => el('option', { value: id, textContent: p.label })));
ui.quality.addEventListener('change', () => {
  api.setSettings({ quality: ui.quality.value });
  renderQualityInfo();
});

// ── Grabación ───────────────────────────────────────

let rec = null; // { recorder, streams, queue, discard, elapsed, segmentStart }

function stopStreams(streams) {
  for (const s of streams) s?.getTracks().forEach((t) => t.stop());
}

function elapsedOf(r) {
  return r.elapsed + (r.segmentStart ? Date.now() - r.segmentStart : 0);
}

function sendStatus(r, status) {
  api.sendStatus({ state: status, elapsedMs: elapsedOf(r), at: Date.now() });
}

ui.recordBtn.addEventListener('click', async () => {
  showMessage(null);
  await api.setSettings({ micId: ui.mic.value || null });
  await api.startRecording({ sourceId: state.sourceId });
});

api.onGo(async () => {
  const streams = [];
  let begun = false;
  try {
    const preset = presetFor(ui.quality.value);
    const size = selectedSource()?.size;
    const video = { frameRate: { ideal: preset.fps, max: preset.fps } };
    if (size) Object.assign(video, { width: { ideal: size.width }, height: { ideal: size.height } });
    const display = await navigator.mediaDevices.getDisplayMedia({ video, audio: false });
    streams.push(display);
    const tracks = display.getVideoTracks();

    if (ui.mic.value) {
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: ui.mic.value },
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streams.push(mic);
      tracks.push(...mic.getAudioTracks());
    }

    const hasAudio = tracks.some((t) => t.kind === 'audio');
    const format = pickFormat(preset, isTypeSupported, hasAudio);
    const recorder = new MediaRecorder(new MediaStream(tracks), {
      mimeType: format.mimeType,
      videoBitsPerSecond: preset.videoBitsPerSecond,
      audioBitsPerSecond: preset.audioBitsPerSecond,
    });

    await api.recBegin({ ext: format.ext });
    begun = true;

    const r = { recorder, streams, queue: Promise.resolve(), discard: false, elapsed: 0, segmentStart: 0 };
    rec = r;

    // Los fragmentos se envían en orden: arrayBuffer() es asíncrono.
    recorder.ondataavailable = (e) => {
      if (!e.data.size) return;
      r.queue = r.queue.then(async () => api.recChunk(await e.data.arrayBuffer()));
    };
    recorder.onstop = async () => {
      stopStreams(r.streams);
      await r.queue;
      rec = null;
      if (r.discard) {
        await api.recDiscard();
        return;
      }
      const file = await api.recFinish();
      switchView('library');
      await refreshLibrary(file);
    };

    // Si Windows corta la captura (p. ej. se cierra la ventana grabada), se guarda lo grabado.
    display.getVideoTracks()[0].addEventListener('ended', () => handleCommand('stop'));

    recorder.start(1000);
    r.segmentStart = Date.now();
    sendStatus(r, 'recording');
  } catch (err) {
    stopStreams(streams);
    rec = null;
    if (begun) await api.recDiscard();
    else api.recAbort();
    showMessage(`No se pudo empezar a grabar: ${err.message}`, true);
  }
});

function handleCommand(cmd) {
  const r = rec;
  if (!r || r.recorder.state === 'inactive') return;
  if (cmd === 'pause' && r.recorder.state === 'recording') {
    r.recorder.pause();
    r.elapsed = elapsedOf(r);
    r.segmentStart = 0;
    sendStatus(r, 'paused');
  } else if (cmd === 'resume' && r.recorder.state === 'paused') {
    r.recorder.resume();
    r.segmentStart = Date.now();
    sendStatus(r, 'recording');
  } else if (cmd === 'stop' || cmd === 'discard') {
    r.discard = cmd === 'discard';
    r.elapsed = elapsedOf(r);
    r.segmentStart = 0;
    sendStatus(r, 'saving');
    r.recorder.stop();
  }
}
api.onCommand(handleCommand);
api.onCancelled(() => showMessage(null));

// ── Biblioteca ──────────────────────────────────────

async function refreshLibrary(selectPath) {
  const items = await api.listRecordings();
  ui.libEmpty.hidden = items.length > 0;
  ui.recordings.replaceChildren(
    ...items.map((item) => {
      const date = new Date(item.mtime).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
      const btn = el('button', { className: 'recording' }, [
        el('strong', { textContent: item.name.replace(/\.(webm|mp4)$/i, '') }),
        el('small', { textContent: `${date} · ${formatBytes(item.size)}` }),
      ]);
      btn.classList.toggle('is-selected', item.path === state.selectedFile?.path);
      btn.addEventListener('click', () => selectRecording(item, date));
      return el('li', {}, [btn]);
    }),
  );

  const target = items.find((i) => i.path === (selectPath ?? state.selectedFile?.path));
  if (target) selectRecording(target, new Date(target.mtime).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }), Boolean(selectPath));
  else clearPlayer();
}

function selectRecording(item, date, autoplay = false) {
  state.selectedFile = item;
  for (const b of ui.recordings.querySelectorAll('.recording')) {
    b.classList.toggle('is-selected', b.querySelector('strong').textContent === item.name.replace(/\.(webm|mp4)$/i, ''));
  }
  ui.player.src = item.url;
  ui.placeholder.hidden = true;
  ui.meta.hidden = false;
  ui.title.textContent = item.name.replace(/\.(webm|mp4)$/i, '');
  ui.sub.textContent = `${date} · ${formatBytes(item.size)}`;
  if (autoplay) ui.player.play().catch(() => {});
}

function clearPlayer() {
  state.selectedFile = null;
  ui.player.removeAttribute('src');
  ui.player.load();
  ui.placeholder.hidden = false;
  ui.meta.hidden = true;
}

$('#open-folder').addEventListener('click', () => api.openFolder());
$('#show-in-folder').addEventListener('click', () => state.selectedFile && api.showInFolder(state.selectedFile.path));
$('#trash-btn').addEventListener('click', async () => {
  if (!state.selectedFile) return;
  ui.player.pause();
  const file = state.selectedFile.path;
  ui.player.removeAttribute('src'); // libera el archivo antes de moverlo
  ui.player.load();
  if (await api.trash(file)) clearPlayer();
  await refreshLibrary();
});
$('#record-now').addEventListener('click', () => switchView('record'));

for (const tab of ui.tabs) tab.addEventListener('click', () => switchView(tab.dataset.view));

// ── Arranque ────────────────────────────────────────

async function init() {
  state.settings = await api.getSettings();
  setShapeButtons(state.settings.shape);
  ui.mirror.checked = state.settings.mirror;
  state.frame = FRAMES[state.settings.frame] ? state.settings.frame : DEFAULT_FRAME;
  if (isHexColor(state.settings.frameColor)) state.frameColor = state.settings.frameColor;
  renderFrames();
  ui.quality.value = PRESETS[state.settings.quality] ? state.settings.quality : 'youtube';
  await unlockDeviceLabels();
  await refreshDevices();
  await refreshSources();
  if (ui.camera.value) applyCamera();
  navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
}

init().catch((err) => showMessage(`Error al iniciar: ${err.message}`, true));
