# Proposal — cheloom-calidad-instalador

## Intent
1. Grabar con calidad apta para publicar en YouTube.
2. Tener CHELOOM instalada, con acceso directo y un atajo de teclado para abrirla.

## Evidencia de partida (sonda en Electron 44.9.0 / Chromium 152, 2026-10-19)
- `MediaRecorder` soporta `video/mp4;codecs=avc1.640033,mp4a.40.2` (H.264 High 5.1 + AAC) → **true**; también VP9/AV1 en WebM.
- Pantalla principal: 2560×1440, escala 1, 144 Hz.
- MVP actual: 30 fps, 6 Mbps VP9, WebM → por debajo de lo que YouTube recomienda para 1440p (16 Mbps a 30 fps, 24 Mbps a 60 fps).

## Scope
**Dentro**: presets de calidad (YouTube 1440p60 · Máxima · Liviana), MP4 H.264 + AAC por defecto con
WebM como respaldo, resolución nativa sin reescalar, ícono de marca, instalador NSIS por usuario (sin admin),
accesos directos en Escritorio y menú Inicio, atajo **Ctrl+Alt+C** en el acceso del menú Inicio.
**Diferido**: firma de código, auto-actualización, bandeja del sistema, atajos globales de grabación, audio del sistema.

## Risks
| Riesgo | Mitigación |
|---|---|
| Instalador sin firmar → SmartScreen avisa | Documentado; "Más información → Ejecutar de todas formas" |
| H.264 por software si no hay codificador de hardware | Preset Liviana; el códec se elige con `isTypeSupported` |
| MP4 de MediaRecorder es fragmentado y de cuadros variables | YouTube lo acepta; para edición pesada se recomienda remux (fuera de alcance) |

## Rollback
Rama `feat/cheloom-mvp`: revertir los commits de este cambio. Desinstalar desde Configuración → Aplicaciones.
