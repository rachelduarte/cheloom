# Tasks — cheloom-mvp

## Fase 1 — Infraestructura
- [ ] 1.1 `package.json` (electron, scripts `start` y `test`), `.gitignore`
- [ ] 1.2 Tokens de la paleta en `src/renderer/theme.css`

## Fase 2 — Lógica pura (TDD)
- [ ] 2.1 Tests en rojo de `shapes` y `format`
- [ ] 2.2 Implementar `src/shared/shapes.js` y `src/shared/format.js` hasta verde

## Fase 3 — Proceso main
- [ ] 3.1 `settings.js` (JSON en userData)
- [ ] 3.2 `recorder-file.js` (stream a `.part`, finish, discard)
- [ ] 3.3 `library.js` (listar, papelera, carpeta)
- [ ] 3.4 `windows.js` (panel, cámara, barra, cuenta regresiva)
- [ ] 3.5 `ipc.js` + `index.js` (handler de display media, permisos)
- [ ] 3.6 `preload/index.js`

## Fase 4 — Renderers
- [ ] 4.1 Panel: fuentes, dispositivos, selector de forma, botón Grabar, MediaRecorder
- [ ] 4.2 Panel: biblioteca con reproductor, mostrar/abrir carpeta, eliminar
- [ ] 4.3 Cámara flotante: formas, espejo, tirador de tamaño, controles en hover
- [ ] 4.4 Barra de grabación: cronómetro, pausar/reanudar, detener, descartar
- [ ] 4.5 Cuenta regresiva 3-2-1 con Esc para cancelar

## Fase 5 — Cierre
- [ ] 5.1 README con uso y limitaciones
- [ ] 5.2 Prueba manual UC-1…UC-5
