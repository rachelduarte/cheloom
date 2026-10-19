# Design — cheloom-mvp

## Arquitectura

```
main (Node)                         renderers (Chromium, contextIsolation)
├── windows.js   crea/posiciona  ─► panel/     fuentes, dispositivos, forma, biblioteca, MediaRecorder
├── ipc.js       canales         ─► camera/    <video> getUserMedia, forma, tirador de tamaño
├── recorder-file.js  escribe    ─► toolbar/   cronómetro, pausar, detener, descartar
├── library.js   lista/papelera  ─► countdown/ 3-2-1
└── settings.js  JSON en userData
preload/index.js → window.cheloom (API mínima vía contextBridge)
shared/  lógica pura y testeable (formas, formato) — usada por main y renderers
```

## Decisiones

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | La cámara se "compone" grabando la pantalla, donde la ventana flotante ya está visible | Es exactamente lo que ve la usuaria (WYSIWYG) y lo que hace Loom; cero coste de composición | Componer en `<canvas>`: duplica trabajo y desincroniza posición |
| D2 | `session.setDisplayMediaRequestHandler` + fuente elegida en el panel | API moderna de Electron; `getDisplayMedia` estándar en el renderer | `chromeMediaSourceId` en `getUserMedia` (legado) |
| D3 | El `MediaRecorder` vive en el panel (oculto durante la grabación, `backgroundThrottling:false`) | Un único dueño del stream; la barra solo manda comandos | Grabar en main: no hay MediaRecorder en Node |
| D4 | Fragmentos de 1 s → IPC → `fs.WriteStream` a `*.part`; al detener se renombra a `.webm` | Memoria constante, y un cierre inesperado conserva lo grabado | Juntar Blobs en memoria |
| D5 | Barra y cuenta regresiva con `setContentProtection(true)` | Windows las excluye de la captura (WDA_EXCLUDEFROMCAPTURE) | Ocultar la barra: la usuaria pierde los controles |
| D6 | Cámara: ventana transparente; forma con CSS, proporción con `setAspectRatio`; tamaño con tirador propio vía IPC `setBounds` | En Windows las ventanas transparentes no se redimensionan con el marco nativo | `resizable:true` nativo (no funciona transparente) |
| D7 | JS vanilla, ES modules en renderers, sin bundler | Proyecto pequeño, arranque inmediato con `electron .` | Vite/React: más dependencias para un MVP |
| D8 | Eliminar con `shell.trashItem` | Reversible (regla: nada de borrado permanente) | `fs.unlink` |

## Secuencia — grabar

```
Panel            Main                Countdown   Toolbar    Camera
 │ start(src)──► │ guarda sourceId
 │               │ panel.hide()
 │               │ abre ───────────► 3-2-1
 │               │ ◄──── done ─────── │ cierra
 │ ◄─ go ─────── │ abre toolbar ────────────────► │
 │ getDisplayMedia ─► handler(sourceId)
 │ MediaRecorder.start(1000)
 │ chunk ──────► │ append(*.part)
 │               │ ◄──── pause/resume/stop ─────── │
 │ ◄─ command ── │
 │ stop → finish►│ rename .webm, cierra toolbar, panel.show(), refresca biblioteca
```

## Interfaces (preload → `window.cheloom`)
- `getSources()` → `[{id, name, thumbnail, isScreen}]`
- `startRecording({sourceId})`, `onGo(cb)`, `onCommand(cb)`, `sendCommand(cmd)`
- `recChunk(arrayBuffer)`, `recFinish()` → `{path}`, `recDiscard()`
- `setCamera({deviceId|null, shape})`, `onCameraConfig(cb)`, `cameraResize({width,height})`
- `listRecordings()`, `trash(path)`, `showInFolder(path)`, `openFolder()`
- `getSettings()`, `setSettings(patch)`

## Lógica pura (`src/shared`)
- `shapes.js`: `SHAPES`, `aspectOf(shape)`, `sizeFor(shape, area)`, `clampSize(shape, w)`
- `format.js`: `formatDuration(ms)`, `recordingFileName(date)`, `formatBytes(n)`

## Archivos
Nuevos: `package.json`, `.gitignore`, `README.md`, `src/main/*` (6), `src/preload/index.js`,
`src/renderer/{theme.css, panel/*, camera/*, toolbar/*, countdown/*}`, `src/shared/*` (2),
`test/*.test.mjs` (2). Modificados/eliminados: ninguno.

## Pruebas
- `node --test` sobre `src/shared` (TDD: rojo → verde).
- Manual: UC-1…UC-5 con `npm start`.
