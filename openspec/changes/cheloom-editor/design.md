# Design — cheloom-editor

## Modelo
Una línea de tiempo es una lista ordenada de fragmentos `{ id, start, end }` en **segundos de la grabación original**.
El tiempo de la línea es la suma de duraciones anteriores: borrar un fragmento "pega" lo demás sin cálculo extra.
Todas las operaciones son puras e inmutables → deshacer/rehacer es una pila de estados.

| # | Decisión | Por qué |
|---|---|---|
| D1 | `src/shared/timeline.js` puro: `createTimeline, split, remove, trim, move, locate, totalDuration` | Testeable; la UI solo dibuja estados |
| D2 | `src/shared/history.js` puro (pila deshacer/rehacer con límite) | Testeable, sin acoplar a la UI |
| D3 | `src/shared/ffmpeg.js` puro: `parseProbe`, `parseProgress`, `buildExportArgs`, `outputFps` | El texto real de FFmpeg se prueba con muestras capturadas |
| D4 | Al abrir: remux `-c copy` a una copia temporal (*proxy*) | Arregla `Duration: N/A` del WebM y el salto en MP4 fragmentado (0,1 s) |
| D5 | Miniaturas: una tira PNG con FFmpeg (`fps,scale,tile`) usada como fondo de cada fragmento | Una sola llamada; cada fragmento muestra su tramo con `background-position` |
| D6 | Exportar con `trim/atrim + setpts + concat` desde el proxy, libx264 `veryfast` CRF 18, AAC 192k, `-fps_mode cfr` 30/60, `+faststart` | Cortes exactos al cuadro; MP4 estándar que abre en cualquier editor |
| D7 | Progreso con `-progress pipe:1` (`out_time_us`) | Formato estable de FFmpeg, sin parsear stderr |
| D8 | Escritura a `*.part` y renombrado al terminar; cancelar = matar el proceso y borrar el `.part` | Igual que la grabación: nunca quedan archivos rotos |
| D9 | Ventana propia `editor` (1280×800) | Más espacio que el panel; puede quedar abierta mientras se graba |
| D10 | `asarUnpack` de `ffmpeg-static` y ruta `app.asar` → `app.asar.unpacked` | Un ejecutable no puede correr desde dentro del asar |

## Secuencia — exportar
```
Editor            Main                         FFmpeg
 │ export(clips) ─► buildExportArgs → spawn ──► trim/concat/x264
 │ ◄─ progress ─── parseProgress(stdout) ◄──── out_time_us=…
 │ cancel ───────► kill + rm .part
 │ ◄─ done(path) ─ rename .part → .mp4, avisa al panel (refresca Biblioteca)
```

## Archivos
Nuevos: `src/shared/{timeline,history,ffmpeg}.js`, `test/{timeline,history,ffmpeg}.test.js`, `src/main/editor.js`,
`src/renderer/editor/{index.html,editor.css,editor.js}`.
Modificados: `ipc.js`, `windows.js`, `preload/index.cjs`, `panel/{index.html,panel.js}`, `package.json`, `README.md`.
