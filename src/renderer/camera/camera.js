import { frameStyle } from '../../shared/frames.js';

const api = window.cheloom;
const cam = document.getElementById('cam');
const video = document.getElementById('video');
const error = document.getElementById('cam-error');
const shapeButtons = document.querySelectorAll('.controls button');
const handle = document.getElementById('resize');

let currentDevice = null;
let stream = null;

async function openDevice(deviceId) {
  if (deviceId === currentDevice && stream) return;
  stream?.getTracks().forEach((t) => t.stop());
  currentDevice = deviceId;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    });
    video.srcObject = stream;
    error.hidden = true;
  } catch {
    stream = null;
    error.hidden = false;
  }
}

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
