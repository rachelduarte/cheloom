# Proposal — cheloom-mvp

## Intent
Tener en el escritorio una grabadora tipo Loom propia (CHELOOM), con la marca personal de la usuaria:
pantalla + cámara + micrófono, cámara flotante con varias formas y una biblioteca local.

## Scope
**Dentro**
1. Grabar pantalla completa o una ventana (`desktopCapturer`) con audio de micrófono.
2. Cámara externa/integrada superpuesta, elegible por dispositivo.
3. Formas de cámara: burbuja (círculo), cuadrado (1:1 redondeado) y rectángulo (16:9).
4. Cámara flotante siempre visible, arrastrable y redimensionable.
5. Controles: cuenta regresiva 3 s, pausar/reanudar, detener, descartar, cronómetro.
6. Biblioteca local: lista, reproductor, renombrar no; eliminar (a la papelera) y abrir carpeta.

**Diferido**
- Nube, enlaces para compartir, comentarios, transcripción, recorte/edición, MP4, atajos globales configurables.

## Approach
Electron con tres ventanas: **panel** (control y biblioteca), **cámara** (flotante, transparente,
`alwaysOnTop`) y **barra de grabación** (flotante). La cámara forma parte del video porque la ventana
flotante se ve en la pantalla capturada — igual que Loom. Se graba con `MediaRecorder` a WebM (VP9/Opus).

## Affected modules
Proyecto nuevo: `src/main`, `src/preload`, `src/renderer/{panel,camera,toolbar}`, `src/shared`.

## Risks
| Riesgo | Mitigación |
|---|---|
| Si se graba solo una ventana, la cámara flotante no sale en el video | Avisarlo en la UI; recomendar pantalla completa (comportamiento igual a Loom) |
| La barra de grabación aparece en el video | `setContentProtection(true)` en la barra (Windows la excluye de la captura) |
| Permisos de cámara/micrófono denegados | Mensaje claro y grabar sin cámara/micro |
| Archivos WebM sin duración en algunos reproductores | Aceptado en MVP; el reproductor de la app los reproduce |

## Rollback
Repositorio nuevo en rama `feat/cheloom-mvp`: revertir = no fusionar la rama.

## Success criteria
- `npm start` abre CHELOOM; se graba 10 s de pantalla con cámara en las tres formas y queda un `.webm`
  reproducible en la biblioteca.
- Pausar/reanudar no corta el archivo; descartar no deja archivo.
