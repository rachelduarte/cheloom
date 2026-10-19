// Pila de deshacer / rehacer sobre estados inmutables.

export function createHistory(present) {
  return { past: [], present, future: [] };
}

export function push(h, state, limit = 100) {
  if (state === h.present) return h;
  return { past: [...h.past, h.present].slice(-limit), present: state, future: [] };
}

export const canUndo = (h) => h.past.length > 0;
export const canRedo = (h) => h.future.length > 0;

export function undo(h) {
  if (!canUndo(h)) return h;
  return { past: h.past.slice(0, -1), present: h.past.at(-1), future: [h.present, ...h.future] };
}

export function redo(h) {
  if (!canRedo(h)) return h;
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}
