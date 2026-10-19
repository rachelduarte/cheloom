import { formatDuration } from '../../shared/format.js';

const api = window.cheloom;
const time = document.getElementById('time');
const dot = document.getElementById('dot');
const pauseBtn = document.getElementById('pause');
const buttons = document.querySelectorAll('.btn');

const PAUSE_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 5v14M15 5v14" /></svg>';
const PLAY_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" /></svg>';

let status = { state: 'starting', elapsedMs: 0, at: Date.now() };

function tick() {
  const running = status.state === 'recording';
  time.textContent = formatDuration(status.elapsedMs + (running ? Date.now() - status.at : 0));
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

api.onStatus((s) => {
  status = s;
  const paused = s.state === 'paused';
  dot.classList.toggle('paused', paused);
  pauseBtn.innerHTML = paused ? PLAY_ICON : PAUSE_ICON;
  pauseBtn.title = paused ? 'Reanudar' : 'Pausar';
  pauseBtn.setAttribute('aria-label', pauseBtn.title);
  if (s.state === 'saving') for (const b of buttons) b.disabled = true;
});

pauseBtn.addEventListener('click', () => api.sendCommand(status.state === 'paused' ? 'resume' : 'pause'));
document.getElementById('stop').addEventListener('click', () => api.sendCommand('stop'));
document.getElementById('discard').addEventListener('click', () => api.sendCommand('discard'));
