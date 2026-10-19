// Genera el ícono de CHELOOM con la paleta de marca.
// Uso: npx electron scripts/make-icon.cjs  → build/icon.png y src/assets/icon.png (1024 px)
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SIZE = 1024;

function draw(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const s = size / 1024;

  // Fondo: cuadrado redondeado en Dusk con un brillo sutil de Horizon arriba a la izquierda.
  const r = 230 * s;
  g.beginPath();
  g.roundRect(0, 0, size, size, r);
  g.fillStyle = '#0C152A';
  g.fill();
  const glow = g.createRadialGradient(260 * s, 220 * s, 0, 260 * s, 220 * s, 760 * s);
  glow.addColorStop(0, 'rgba(32,190,198,0.22)');
  glow.addColorStop(1, 'rgba(32,190,198,0)');
  g.fillStyle = glow;
  g.fill();

  // Burbuja de cámara: anillo Horizon → Magenta.
  const cx = size / 2;
  const cy = size / 2;
  const ring = g.createLinearGradient(180 * s, 180 * s, 844 * s, 844 * s);
  ring.addColorStop(0, '#20BEC6');
  ring.addColorStop(1, '#ED0180');
  g.beginPath();
  g.arc(cx, cy, 330 * s, 0, Math.PI * 2);
  g.lineWidth = 92 * s;
  g.strokeStyle = ring;
  g.stroke();

  // Punto de grabación en Magenta, con borde Cloud fino.
  g.beginPath();
  g.arc(cx, cy, 150 * s, 0, Math.PI * 2);
  g.fillStyle = '#ED0180';
  g.fill();
  g.lineWidth = 10 * s;
  g.strokeStyle = 'rgba(201,222,232,0.85)';
  g.stroke();

  return c.toDataURL('image/png');
}

app.whenReady().then(async () => {
  const w = new BrowserWindow({ show: false });
  await w.loadURL('about:blank');
  const dataUrl = await w.webContents.executeJavaScript(`(${draw.toString()})(${SIZE})`);
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  const root = path.join(__dirname, '..');
  for (const target of ['build/icon.png', 'src/assets/icon.png']) {
    const file = path.join(root, target);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, png);
  }
  app.exit(0);
});
