// Formato de tiempos, nombres de archivo y tamaños. Lógica pura.

const pad = (n) => String(n).padStart(2, '0');

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Como formatDuration, pero con décimas (truncadas) para el editor.
export function formatTimecode(seconds) {
  const s = Math.max(0, seconds);
  const tenths = Math.floor((s * 10) % 10);
  return `${formatDuration(Math.floor(s) * 1000)}.${tenths}`;
}

export function recordingFileName(date = new Date(), ext = 'webm') {
  const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const t = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `cheloom ${d} ${t}.${ext}`;
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${Number(value.toFixed(1))} ${units[i]}`;
}
