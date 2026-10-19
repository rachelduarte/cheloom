# Design — cheloom-color-marco

| # | Decisión | Por qué |
|---|---|---|
| D1 | `frames.js` puro: `FRAMES`, `frameStyle(id, customHex)` → `{ background, width }` | Testeable; la usan panel (muestras) y cámara (marco) |
| D2 | La cámara usa variables CSS `--frame` y `--frame-width` | Cambiar color es solo cambiar dos variables, sin recrear la ventana |
| D3 | Settings: `frame` (id) y `frameColor` (hex) | El personalizado se conserva aunque se pase a otro color y se vuelva |
| D4 | Viaja en el mismo `camera:config` que la forma | Un solo canal, un solo estado |

Archivos: nuevos `src/shared/frames.js`, `test/frames.test.js`; modificados `settings.js`, `ipc.js`,
`camera/{camera.css,camera.js}`, `panel/{index.html,panel.css,panel.js}`, `README.md`.
