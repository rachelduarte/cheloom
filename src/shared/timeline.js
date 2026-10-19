// Línea de tiempo del editor: fragmentos { id, start, end } en segundos de la grabación original.
// El tiempo de la línea es la suma de duraciones previas, así que borrar un fragmento "pega" el resto.
// Todas las operaciones son puras: devuelven un estado nuevo (o el mismo si no cambia nada).

export const MIN_CLIP = 0.1;

let seq = 0;
const nextId = () => `c${++seq}`;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const len = (c) => c.end - c.start;

export function createTimeline(sourceDuration) {
  return { source: sourceDuration, clips: [{ id: nextId(), start: 0, end: sourceDuration }] };
}

export function totalDuration(tl) {
  return tl.clips.reduce((sum, c) => sum + len(c), 0);
}

export function clipOffset(tl, index) {
  let offset = 0;
  for (let i = 0; i < index; i++) offset += len(tl.clips[i]);
  return offset;
}

// Tiempo de la línea → fragmento y segundo de la grabación original.
export function locate(tl, t) {
  if (t <= 0) return { index: 0, sourceTime: tl.clips[0].start };
  let offset = 0;
  for (let i = 0; i < tl.clips.length; i++) {
    const c = tl.clips[i];
    if (t < offset + len(c)) return { index: i, sourceTime: c.start + (t - offset) };
    offset += len(c);
  }
  const last = tl.clips.length - 1;
  return { index: last, sourceTime: tl.clips[last].end };
}

export function split(tl, t) {
  const { index } = locate(tl, t);
  const clip = tl.clips[index];
  const local = t - clipOffset(tl, index);
  if (local < MIN_CLIP || len(clip) - local < MIN_CLIP) return tl;
  const cut = clip.start + local;
  const clips = [...tl.clips];
  clips.splice(index, 1, { id: clip.id, start: clip.start, end: cut }, { id: nextId(), start: cut, end: clip.end });
  return { ...tl, clips };
}

export function remove(tl, id) {
  if (tl.clips.length <= 1) return tl;
  const clips = tl.clips.filter((c) => c.id !== id);
  return clips.length === tl.clips.length ? tl : { ...tl, clips };
}

// Recorta un borde. Puede estirarse para recuperar material borrado, dentro de la grabación original.
export function trim(tl, id, edge, value) {
  const clips = tl.clips.map((c) => {
    if (c.id !== id) return c;
    return edge === 'start'
      ? { ...c, start: clamp(value, 0, c.end - MIN_CLIP) }
      : { ...c, end: clamp(value, c.start + MIN_CLIP, tl.source) };
  });
  return { ...tl, clips };
}

export function move(tl, id, newIndex) {
  const from = tl.clips.findIndex((c) => c.id === id);
  const to = clamp(newIndex, 0, tl.clips.length - 1);
  if (from === -1 || from === to) return tl;
  const clips = [...tl.clips];
  const [clip] = clips.splice(from, 1);
  clips.splice(to, 0, clip);
  return { ...tl, clips };
}
