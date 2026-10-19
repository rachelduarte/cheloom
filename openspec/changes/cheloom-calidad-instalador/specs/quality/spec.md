# Spec — quality (delta sobre recording)

## Requirements
- R1. La app MUST ofrecer tres presets: **YouTube** (60 fps, 24 Mbps, predeterminado), **Máxima** (60 fps, 40 Mbps)
  y **Liviana** (30 fps, 8 Mbps).
- R2. Los presets YouTube y Máxima MUST preferir MP4 H.264 + AAC; si no hay soporte, MUST caer a WebM VP9 + Opus.
- R3. La captura MUST pedir la resolución física de la pantalla elegida (sin reescalar).
- R4. El nombre del archivo MUST usar la extensión real del contenedor (`.mp4` o `.webm`).
- R5. La biblioteca MUST listar `.mp4` y `.webm`.
- R6. El panel SHOULD mostrar el resultado esperado (p. ej. "MP4 · H.264 · 60 fps · 24 Mbps").

## UC-6 Elegir la calidad
**Ruta:** Panel → *Grabar* → desplegable **Calidad**.
1. La creadora elige **YouTube**.
2. El panel muestra "MP4 · H.264 · 60 fps · 24 Mbps".
3. Graba (UC-1); el archivo resultante es `.mp4`.

**Extensiones**
- 2a. El equipo no soporta MP4: el panel muestra "WebM · VP9" y el archivo es `.webm`.
