import { formatDuration, formatTimecode } from '../../shared/format.js';
import { canRedo, canUndo, createHistory, push, redo, undo } from '../../shared/history.js';
import { clipOffset, createTimeline, locate, move, remove, split, totalDuration, trim } from '../../shared/timeline.js';

const api = window.cheloom;
const $ = (sel) => document.querySelector(sel);

const ui = {
  fileName: $('#file-name'),
  video: $('#video'),
  loading: $('#loading'),
  loadingText: $('#loading-text'),
  undo: $('#undo'),
  redo: $('#redo'),
  play: $('#play'),
  timeNow: $('#time-now'),
  timeTotal: $('#time-total'),
  split: $('#split'),
  delete: $('#delete'),
  zoom: $('#zoom'),
  export: $('#export'),
  scroll: $('#scroll'),
  lane: $('#lane'),
  ruler: $('#ruler'),
  clips: $('#clips'),
  drop: $('#drop'),
  playhead: $('#playhead'),
  modal: $('#modal'),
  modalTitle: $('#modal-title'),
  barFill: $('#bar-fill'),
  barText: $('#bar-text'),
  doneText: $('#done-text'),
  errorText: $('#error-text'),
};

const PLAY_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" /></svg>';
const PAUSE_ICON = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>';
const FRAME = 1 / 30;
const TICK_STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200];

let media = null; // { name, url, duration, width, height, fps, hasAudio }
let history = null;
let exportedState = null; // estado ya exportado: si no cambió, no hay nada que perder al cerrar
let draft = null; // estado temporal mientras se arrastra un borde
let frozenPps = null; // escala fija durante un arrastre, para que no "baile"
let strip = null;
let selectedId = null;
let playhead = 0;
let playing = false;
let currentIndex = 0;
let lastExport = null;

const tl = () => draft ?? history.present;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const clipLen = (c) => c.end - c.start;

// ── Carga ───────────────────────────────────────────

function setLoading(text) {
  ui.loading.hidden = !text;
  if (text) ui.loadingText.textContent = text;
}

async function load(file) {
  pause();
  setLoading('Preparando video…');
  try {
    media = await api.editorPrepare(file);
  } catch (err) {
    setLoading(null);
    showModal('error', err.message);
    return;
  }
  strip = null;
  history = createHistory(createTimeline(media.duration));
  exportedState = history.present;
  selectedId = history.present.clips[0].id;
  ui.fileName.textContent = media.name;
  document.title = `CHELOOM · Editor · ${media.name}`;
  ui.zoom.value = '1';
  ui.video.src = media.url;
  await new Promise((resolve) => {
    ui.video.addEventListener('loadedmetadata', resolve, { once: true });
    ui.video.addEventListener('error', resolve, { once: true });
  });
  setLoading(null);
  seek(0);
  syncDirty();
  render();
}

api.onEditorStrip((s) => {
  strip = s;
  render();
});

api.onEditorLoad((file) => {
  if (isDirty() && !confirm('Tienes cambios sin exportar. ¿Abrir otro video y perderlos?')) return;
  load(file);
});

// ── Estado ──────────────────────────────────────────

function isDirty() {
  return Boolean(history) && history.present !== exportedState;
}

function syncDirty() {
  api.editorSetDirty(isDirty());
}

function commit(next) {
  draft = null;
  if (next !== history.present) history = push(history, next);
  afterChange();
}

function afterChange() {
  const t = tl();
  if (!t.clips.some((c) => c.id === selectedId)) selectedId = t.clips[locate(t, playhead).index]?.id ?? null;
  playhead = clamp(playhead, 0, totalDuration(t));
  syncDirty();
  seek(playhead);
  render();
}

// ── Reproducción de la secuencia editada ────────────

function seek(t) {
  const timeline = tl();
  const total = totalDuration(timeline);
  playhead = clamp(t, 0, total);
  const { index, sourceTime } = locate(timeline, Math.min(playhead, total - 0.001));
  currentIndex = index;
  if (Math.abs(ui.video.currentTime - sourceTime) > 0.001) ui.video.currentTime = sourceTime;
  renderPlayhead();
}

function play() {
  if (!media) return;
  if (playhead >= totalDuration(tl()) - 0.05) seek(0);
  playing = true;
  ui.video.play().catch(() => {});
  ui.play.innerHTML = PAUSE_ICON;
  ui.play.title = 'Pausar (Espacio)';
  requestAnimationFrame(tick);
}

function pause() {
  playing = false;
  ui.video.pause();
  ui.play.innerHTML = PLAY_ICON;
  ui.play.title = 'Reproducir (Espacio)';
}

// Al llegar al final de un fragmento salta al inicio del siguiente: así se "ve" el video pegado.
function tick() {
  if (!playing) return;
  const t = tl();
  const v = ui.video;
  const clip = t.clips[currentIndex];
  if (!clip) return pause();

  if (v.currentTime >= clip.end - 0.015 || v.ended) {
    const next = t.clips[currentIndex + 1];
    if (!next) {
      playhead = totalDuration(t);
      renderPlayhead();
      return pause();
    }
    currentIndex += 1;
    if (Math.abs(next.start - v.currentTime) > 0.05) v.currentTime = next.start;
    if (v.paused) v.play().catch(() => {});
  } else if (v.currentTime < clip.start - 0.05) {
    v.currentTime = clip.start;
  }

  const current = t.clips[currentIndex];
  playhead = clipOffset(t, currentIndex) + clamp(v.currentTime - current.start, 0, clipLen(current));
  renderPlayhead();
  requestAnimationFrame(tick);
}

// ── Dibujo ──────────────────────────────────────────

function pps() {
  if (frozenPps) return frozenPps;
  const width = Math.max(200, ui.scroll.clientWidth - 48);
  return (width / Math.max(totalDuration(tl()), 0.1)) * Number(ui.zoom.value);
}

function render() {
  if (!media) return;
  const t = tl();
  const scale = pps();
  const total = totalDuration(t);
  ui.lane.style.width = `${total * scale}px`;

  ui.clips.replaceChildren(
    ...t.clips.map((c) => {
      const el = document.createElement('div');
      el.className = 'clip';
      el.dataset.id = c.id;
      el.classList.toggle('is-selected', c.id === selectedId);
      el.style.width = `${clipLen(c) * scale}px`;
      if (strip) {
        el.style.backgroundImage = `url("${strip.url}")`;
        el.style.backgroundSize = `${t.source * scale}px 100%`;
        el.style.backgroundPosition = `${-c.start * scale}px 0`;
      }
      const label = document.createElement('span');
      label.className = 'clip-label';
      label.textContent = formatTimecode(clipLen(c));
      const start = document.createElement('div');
      start.className = 'handle start';
      start.dataset.edge = 'start';
      const end = document.createElement('div');
      end.className = 'handle end';
      end.dataset.edge = 'end';
      el.append(start, end, label);
      return el;
    }),
  );

  renderRuler(total, scale);
  renderPlayhead();

  ui.undo.disabled = !canUndo(history);
  ui.redo.disabled = !canRedo(history);
  ui.delete.disabled = !selectedId || t.clips.length < 2;
  ui.split.disabled = split(t, playhead) === t;
  ui.timeTotal.textContent = formatTimecode(total);
}

function renderRuler(total, scale) {
  const step = TICK_STEPS.find((s) => s * scale >= 70) ?? TICK_STEPS.at(-1);
  const ticks = [];
  for (let s = 0; s <= total + 0.001; s += step) {
    const tick = document.createElement('span');
    tick.className = 'tick';
    tick.style.left = `${s * scale}px`;
    tick.textContent = step < 1 ? formatTimecode(s) : formatDuration(s * 1000);
    ticks.push(tick);
  }
  ui.ruler.replaceChildren(...ticks);
}

function renderPlayhead() {
  if (!media) return;
  ui.playhead.style.left = `${playhead * pps()}px`;
  ui.timeNow.textContent = formatTimecode(playhead);
  if (!frozenPps) ui.split.disabled = split(tl(), playhead) === tl();
  if (playing) keepPlayheadVisible();
}

function keepPlayheadVisible() {
  const x = playhead * pps();
  const { scrollLeft, clientWidth } = ui.scroll;
  if (x < scrollLeft || x > scrollLeft + clientWidth - 60) ui.scroll.scrollLeft = x - 60;
}

new ResizeObserver(() => render()).observe(ui.scroll);
ui.zoom.addEventListener('input', () => {
  render();
  keepPlayheadVisible();
});

// ── Edición ─────────────────────────────────────────

function doSplit() {
  const t = tl();
  const next = split(t, playhead);
  if (next === t) return;
  commit(next);
  selectedId = next.clips[locate(next, playhead).index].id;
  render();
}

function doDelete() {
  if (!selectedId) return;
  pause();
  const t = tl();
  const index = t.clips.findIndex((c) => c.id === selectedId);
  const next = remove(t, selectedId);
  if (next === t) return;
  playhead = clipOffset(next, Math.min(index, next.clips.length - 1));
  selectedId = next.clips[Math.min(index, next.clips.length - 1)].id;
  commit(next);
}

function doUndo() {
  pause();
  history = undo(history);
  afterChange();
}

function doRedo() {
  pause();
  history = redo(history);
  afterChange();
}

ui.split.addEventListener('click', doSplit);
ui.delete.addEventListener('click', doDelete);
ui.undo.addEventListener('click', doUndo);
ui.redo.addEventListener('click', doRedo);
ui.play.addEventListener('click', () => (playing ? pause() : play()));

// ── Ratón: cabezal, recortes y reordenar ────────────

const laneX = (e) => e.clientX - ui.lane.getBoundingClientRect().left;

function scrub(e) {
  pause();
  const update = (ev) => seek(laneX(ev) / pps());
  update(e);
  const up = () => {
    window.removeEventListener('pointermove', update);
    window.removeEventListener('pointerup', up);
  };
  window.addEventListener('pointermove', update);
  window.addEventListener('pointerup', up);
}

ui.ruler.addEventListener('pointerdown', scrub);
ui.playhead.querySelector('.knob').addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  scrub(e);
});

ui.clips.addEventListener('pointerdown', (e) => {
  if (!media || e.button !== 0) return;
  const clipEl = e.target.closest('.clip');
  if (!clipEl) return scrub(e);
  const id = clipEl.dataset.id;
  selectedId = id;
  if (e.target.dataset.edge) return startTrim(e, id, e.target.dataset.edge);
  startClipDrag(e, id, clipEl);
});

function startTrim(e, id, edge) {
  e.preventDefault();
  pause();
  const base = history.present;
  const clip = base.clips.find((c) => c.id === id);
  const original = edge === 'start' ? clip.start : clip.end;
  const startX = e.clientX;
  frozenPps = pps();

  const moveTrim = (ev) => {
    draft = trim(base, id, edge, original + (ev.clientX - startX) / frozenPps);
    const c = draft.clips.find((x) => x.id === id);
    ui.video.currentTime = edge === 'start' ? c.start : Math.max(c.start, c.end - FRAME); // muestra el cuadro del borde
    render();
  };
  const up = () => {
    window.removeEventListener('pointermove', moveTrim);
    window.removeEventListener('pointerup', up);
    const next = draft ?? base;
    frozenPps = null;
    const index = next.clips.findIndex((c) => c.id === id);
    playhead = clipOffset(next, index) + (edge === 'start' ? 0 : clipLen(next.clips[index]) - FRAME);
    commit(next);
  };
  window.addEventListener('pointermove', moveTrim);
  window.addEventListener('pointerup', up);
  render();
}

function startClipDrag(e, id, clipEl) {
  const startX = e.clientX;
  const clickTime = laneX(e) / pps();
  let dragging = false;
  let target = null;

  const moveDrag = (ev) => {
    const dx = ev.clientX - startX;
    if (!dragging && Math.abs(dx) < 5) return;
    if (!dragging) {
      dragging = true;
      pause();
      clipEl.classList.add('is-dragging');
    }
    clipEl.style.transform = `translateX(${dx}px)`;
    // Índice de inserción entre los demás fragmentos, según el centro de cada uno.
    const t = tl();
    const others = t.clips.filter((c) => c.id !== id);
    const pointer = laneX(ev) / pps();
    let offset = 0;
    target = others.length;
    for (let i = 0; i < others.length; i++) {
      if (pointer < offset + clipLen(others[i]) / 2) {
        target = i;
        break;
      }
      offset += clipLen(others[i]);
    }
    let dropAt = 0;
    for (let i = 0; i < target; i++) dropAt += clipLen(others[i]);
    ui.drop.hidden = false;
    ui.drop.style.left = `${dropAt * pps()}px`;
  };
  const up = () => {
    window.removeEventListener('pointermove', moveDrag);
    window.removeEventListener('pointerup', up);
    ui.drop.hidden = true;
    if (dragging && target !== null) {
      const next = move(tl(), id, target);
      playhead = clipOffset(next, next.clips.findIndex((c) => c.id === id));
      commit(next);
    } else {
      seek(clickTime);
      render();
    }
  };
  window.addEventListener('pointermove', moveDrag);
  window.addEventListener('pointerup', up);
  // Sin render(): reconstruir el DOM soltaría el elemento que se va a arrastrar.
  for (const el of ui.clips.children) el.classList.toggle('is-selected', el.dataset.id === id);
  ui.delete.disabled = tl().clips.length < 2;
}

// ── Teclado ─────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (!media || !ui.modal.hidden || (e.target instanceof Element && e.target.matches('input'))) return;
  const key = e.key.toLowerCase();
  if (e.ctrlKey && key === 'z' && !e.shiftKey) doUndo();
  else if (e.ctrlKey && (key === 'y' || (key === 'z' && e.shiftKey))) doRedo();
  else if (e.ctrlKey) return;
  else if (key === ' ') playing ? pause() : play();
  else if (key === 's') doSplit();
  else if (key === 'delete' || key === 'backspace') doDelete();
  else if (key === 'arrowleft') seek(playhead - (e.shiftKey ? 1 : FRAME));
  else if (key === 'arrowright') seek(playhead + (e.shiftKey ? 1 : FRAME));
  else if (key === 'home') seek(0);
  else if (key === 'end') seek(totalDuration(tl()));
  else return;
  e.preventDefault();
});

// ── Exportar ────────────────────────────────────────

function showModal(state, detail = '') {
  ui.modal.hidden = false;
  for (const el of ui.modal.querySelectorAll('[data-state]')) el.hidden = el.dataset.state !== state;
  ui.modalTitle.textContent = { progress: 'Exportando…', done: 'Video exportado', error: 'Algo salió mal' }[state];
  if (state === 'progress') setProgress(0);
  if (state === 'done') ui.doneText.textContent = detail;
  if (state === 'error') ui.errorText.textContent = detail;
}

function hideModal() {
  ui.modal.hidden = true;
}

function setProgress(ratio) {
  const pct = Math.round(ratio * 100);
  ui.barFill.style.width = `${pct}%`;
  ui.barText.textContent = `${pct} %`;
}

api.onEditorProgress(setProgress);

ui.export.addEventListener('click', async () => {
  if (!media) return;
  pause();
  ui.export.disabled = true;
  showModal('progress');
  try {
    const file = await api.editorExport(tl().clips.map(({ start, end }) => ({ start, end })));
    if (!file) return hideModal(); // cancelado
    lastExport = file;
    exportedState = history.present;
    syncDirty();
    showModal('done', `Se guardó como «${file.split(/[\\/]/).pop()}» y ya aparece en tu Biblioteca.`);
  } catch (err) {
    showModal('error', err.message);
  } finally {
    ui.export.disabled = false;
  }
});

$('#cancel-export').addEventListener('click', () => api.editorCancel());
$('#show-file').addEventListener('click', () => lastExport && api.showInFolder(lastExport));
$('#close-modal').addEventListener('click', hideModal);
$('#close-error').addEventListener('click', hideModal);

// ── Arranque ────────────────────────────────────────

ui.play.innerHTML = PLAY_ICON;
const initial = new URLSearchParams(location.search).get('file');
if (initial) load(initial);
