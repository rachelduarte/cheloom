// Formas de la cámara flotante. Lógica pura: la usan main (tamaño de ventana) y renderers (CSS).

export const MIN_SIDE = 120;
export const MAX_SIDE = 720;

export const SHAPES = {
  bubble: { label: 'Burbuja', aspect: 1, radius: '50%' },
  square: { label: 'Cuadrado', aspect: 1, radius: '18%' },
  rect: { label: 'Rectángulo', aspect: 16 / 9, radius: '14px' },
};

export function aspectOf(shape) {
  return (SHAPES[shape] ?? SHAPES.bubble).aspect;
}

// Ancho y alto para una forma partiendo del ancho deseado, con el lado mayor acotado.
export function clampSize(shape, width) {
  const aspect = aspectOf(shape);
  let w = width;
  let h = width / aspect;
  const longSide = Math.max(w, h);
  const scale = Math.min(Math.max(longSide, MIN_SIDE), MAX_SIDE) / longSide;
  w *= scale;
  h *= scale;
  return { width: Math.round(w), height: Math.round(h) };
}

// Tamaño que conserva un área dada; sirve para cambiar de forma sin que la cámara "salte".
export function sizeFor(shape, area) {
  return clampSize(shape, Math.sqrt(area * aspectOf(shape)));
}
