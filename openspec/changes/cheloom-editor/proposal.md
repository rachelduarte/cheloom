# Proposal — cheloom-editor

## Intent
Un editor pequeño, al estilo del editor de video de Canva: dividir la grabación, borrar lo que sobra, recortar los
bordes y reordenar fragmentos. Al exportar, los fragmentos quedan pegados en un solo video.

## Decisiones de la usuaria (2026-10-19)
- "Capas" = **fragmentos en una sola pista** que se pegan sin huecos. Las pistas superpuestas (texto, imágenes) quedan diferidas.
- Motor de exportación: **FFmpeg** (`ffmpeg-static` 5.3.0 → FFmpeg 6.1.1 con libx264, 83 MB, GPL-3.0-or-later).

## Evidencia (prototipo sobre grabaciones reales, 2026-10-19)
- WebM de MediaRecorder: `Duration: N/A` → un remux `-c copy` (0,1 s) lo deja indexado (20,70 s).
- MP4 de MediaRecorder: fragmentado, 35,72 fps promedio (cuadros variables), 2560×1440, AAC mono.
- Dos fragmentos (1–5 s y 10–16 s) con `trim/atrim + concat` → 10,00 s exactos, 1440p, en 3,7 s (≈2,7× tiempo real).

## Scope
**Dentro**: abrir desde la Biblioteca · vista previa que reproduce la secuencia editada · dividir en el cabezal ·
eliminar fragmento · recortar bordes arrastrando · reordenar arrastrando · deshacer/rehacer · miniaturas en la
línea de tiempo · zoom · exportar a MP4 (H.264 + AAC, CFR) con progreso y cancelar · atajos de teclado.
**Diferido**: pistas superpuestas, texto, transiciones, música, guardar el proyecto para seguir después, varias fuentes.

## Risks
| Riesgo | Mitigación |
|---|---|
| Instalador +83 MB | Aceptado por la usuaria al elegir FFmpeg |
| FFmpeg es GPL | Se distribuye como ejecutable aparte, con su licencia y aviso en el README |
| Exportación lenta en PCs modestas | libx264 `veryfast`; progreso y cancelar |
| Archivos de cuadros variables | Exportación con `-fps_mode cfr` a 30 o 60 fps |

## Rollback
Revertir los commits del cambio y quitar `ffmpeg-static`.
