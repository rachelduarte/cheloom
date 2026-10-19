# Design — cheloom-calidad-instalador

| # | Decisión | Por qué |
|---|---|---|
| D1 | `src/shared/quality.js` puro: `PRESETS`, `pickFormat(preset, isTypeSupported, hasAudio)` | Testeable sin Electron; el renderer le pasa `MediaRecorder.isTypeSupported` |
| D2 | MP4 H.264 + AAC por defecto | Formato que YouTube y cualquier editor aceptan; Chromium usa el codificador de hardware (Media Foundation) si existe |
| D3 | 24 Mbps a 60 fps para 1440p | Recomendación de subida de YouTube para 1440p60 SDR; subir en 1440p hace que YouTube procese en VP9/AV1 |
| D4 | `getDisplayMedia` con `width/height` ideales = tamaño físico de la pantalla | Evita reescalados; main entrega el tamaño en `sources:list` |
| D5 | `recordingFileName(date, ext)`; `begin({ext})` en main | La extensión depende del códec elegido en tiempo de ejecución |
| D6 | electron-builder NSIS `oneClick`, `perMachine:false` | Instala en `%LOCALAPPDATA%\Programs`, sin UAC |
| D7 | `build/installer.nsh` → `customInstall` recrea el acceso del menú Inicio con `CONTROL|ALT|C` | electron-builder no expone el atajo; NSIS `CreateShortCut` sí |
| D8 | Ícono 1024 px generado por script con la paleta (`scripts/make-icon.cjs`, render en Electron) | Sin dependencias de imagen; reproducible |

Archivos: nuevos `src/shared/quality.js`, `test/quality.test.js`, `build/icon.png`, `build/installer.nsh`,
`scripts/make-icon.cjs`; modificados `format.js`, `test/format.test.js`, `ipc.js`, `recorder-file.js`, `library.js`,
`windows.js`, `panel/{index.html,panel.js}`, `preload/index.cjs`, `package.json`, `README.md`.
