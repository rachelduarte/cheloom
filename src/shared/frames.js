// Colores del marco de la cámara flotante. Lógica pura: la usan el panel (muestras) y la cámara (marco).

export const DEFAULT_FRAME = 'gradient';
export const DEFAULT_FRAME_WIDTH = 4;

export const FRAMES = {
  gradient: { label: 'Degradado', background: 'linear-gradient(135deg, #20BEC6, #ED0180)' },
  sunset: { label: 'Atardecer', background: 'linear-gradient(135deg, #C9DEE8, #ED0180 55%, #0A0F0F)' },
  horizon: { label: 'Horizon', background: '#20BEC6' },
  magenta: { label: 'Magenta', background: '#ED0180' },
  cloud: { label: 'Cloud', background: '#C9DEE8' },
  lead: { label: 'Lead', background: '#9EACB2' },
  blackout: { label: 'Blackout', background: '#0A0F0F' },
  none: { label: 'Sin marco', background: 'transparent' },
  custom: { label: 'Personalizado', background: null },
};

export function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

export function frameStyle(id, customHex) {
  if (id === 'none') return { background: 'transparent', width: 0 };
  if (id === 'custom' && isHexColor(customHex)) return { background: customHex, width: DEFAULT_FRAME_WIDTH };
  const frame = FRAMES[id]?.background ? FRAMES[id] : FRAMES[DEFAULT_FRAME];
  return { background: frame.background, width: DEFAULT_FRAME_WIDTH };
}
