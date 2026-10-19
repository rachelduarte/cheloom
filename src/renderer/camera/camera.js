import { cameraErrorMessage, shouldFallBackToDefault, shouldRetry } from '../../shared/camera-errors.js';
import { frameStyle } from '../../shared/frames.js';

const api = window.cheloom;
const cam = document.getElementById('cam');
const video = document.getElementById('video');
const error = document.getElementById('cam-error');
const shapeButtons = document.querySelectorAll('.controls button');
const handle = document.getElementById('resize');

const QUALITY = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
const RETRY_MS = 3000;

let wanted = null; // dispositivo pedido por el panel
let opening = null; // dispositivo que se está abriendo ahora
let stream = null;
let attempt = 0; // cada apertura nueva invalida las anteriores
let retryTimer = 0;

function showError(err) {
  console.error(`[CHELOOM cámara] ${err.name}: ${err.message}`);
  error.textContent = cameraErrorMessage(err.name);
  error.hidden = false;
}

async function openDevice(deviceId) {
  wanted = deviceId;
  // Ya abierta o abriéndose con este dispositivo: nada que hacer (evita aperturas en paralelo).
  if (deviceId === opening || (stream?.active && stream.__deviceId === deviceId)) return;

  clearTimeout(retryTimer);
  const mine = ++attempt;
  opening = deviceId;
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;

  let next = null;
  try {
    next = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId }, ...QUALITY } });
  } catch (err) {
    if (shouldFallBackToDefault(err.name)) {
      try {
        next = await navigator.mediaDevices.getUserMedia({ video: QUALITY });
      } catch (err2) {
        if (mine === attempt) fail(err2, deviceId);
        return;
      }
    } else {
      if (mine === attempt) fail(err, deviceId);
      return;
    }
  }

  // Si mientras tanto se pidió otro dispositivo, esta apertura ya no sirve.
  if (mine !== attempt) {
    next.getTracks().forEach((t) => t.stop());
    return;
  }
  opening = null;
  next.__deviceId = deviceId;
  stream = next;
  video.srcObject = stream;
  error.hidden = true;
  // Si Windows corta la cámara (se desconecta, otra app la toma), se reintenta.
  stream.getVideoTracks()[0]?.addEventListener('ended', () => scheduleRetry());
}

function fail(err, deviceId) {
  opening = null;
  showError(err);
  if (shouldRetry(err.name) && deviceId === wanted) scheduleRetry();
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    stream = null;
    if (wanted) openDevice(wanted);
  }, RETRY_MS);
}

// Clic sobre el aviso: reintentar ya.
error.addEventListener('pointerdown', (e) => e.stopPropagation());
error.addEventListener('click', () => {
  stream = null;
  if (wanted) openDevice(wanted);
});
navigator.mediaDevices.addEventListener('devicechange', () => {
  if (wanted && !stream?.active) openDevice(wanted);
});

api.onCameraConfig(({ deviceId, shape, mirror, frame, frameColor }) => {
  cam.className = `cam shape-${shape}`;
  cam.classList.toggle('mirror', mirror);
  const style = frameStyle(frame, frameColor);
  cam.style.setProperty('--frame', style.background);
  cam.style.setProperty('--frame-width', `${style.width}px`);
  for (const b of shapeButtons) b.classList.toggle('is-active', b.dataset.shape === shape);
  openDevice(deviceId);
});

for (const b of shapeButtons) {
  b.addEventListener('pointerdown', (e) => e.stopPropagation());
  b.addEventListener('click', () => api.requestShape(b.dataset.shape));
}

// ── Arrastrar ───────────────────────────────────────
cam.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  const offsetX = e.clientX;
  const offsetY = e.clientY;
  cam.setPointerCapture(e.pointerId);
  const move = (ev) => api.moveCamera({ x: ev.screenX - offsetX, y: ev.screenY - offsetY });
  const up = (ev) => {
    api.moveCamera({ x: ev.screenX - offsetX, y: ev.screenY - offsetY, done: true });
    cam.removeEventListener('pointermove', move);
    cam.removeEventListener('pointerup', up);
  };
  cam.addEventListener('pointermove', move);
  cam.addEventListener('pointerup', up);
});

// ── Redimensionar (la proporción la impone main según la forma) ─
handle.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  const startX = e.screenX;
  const startY = e.screenY;
  const startWidth = window.innerWidth;
  const ratio = window.innerWidth / window.innerHeight;
  handle.setPointerCapture(e.pointerId);
  let frame = 0;
  const move = (ev) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      // Se usa el mayor de los dos desplazamientos para que la esquina siga al cursor.
      const delta = Math.max(ev.screenX - startX, (ev.screenY - startY) * ratio);
      api.resizeCamera(startWidth + delta);
    });
  };
  const up = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});
