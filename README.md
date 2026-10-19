# CHELOOM

Grabadora de pantalla y cámara para el escritorio, al estilo Loom, con marca propia. Todo es local: no sube nada a la nube.

## Qué hace

- Graba **pantalla completa o una ventana**, con el audio del **micrófono**.
- **Cámara flotante** siempre visible, con tres formas: **burbuja**, **cuadrado** y **rectángulo 16:9**.
  Se arrastra con el mouse y se agranda o achica desde el tirador magenta de la esquina.
- **Cuenta regresiva** de 3 s (Esc o clic para cancelar), **pausar / reanudar**, **detener** y **descartar**.
- **Biblioteca**: lista, reproductor, *Mostrar en carpeta*, *Abrir carpeta* y *Eliminar* (manda el archivo a la Papelera).

Las grabaciones se guardan en `%USERPROFILE%\Videos\CHELOOM` como `CHELOOM AAAA-MM-DD HH-mm-ss.webm`.

## Uso

```bash
npm install
npm start
```

Pruebas de la lógica pura (formas y formato):

```bash
npm test
```

## Cómo funciona

| Pieza | Archivo |
|---|---|
| Ventanas (panel, cámara, barra, cuenta regresiva) | `src/main/windows.js` |
| Canales IPC y flujo de grabación | `src/main/ipc.js` |
| Escritura a disco en fragmentos (`.part` → `.webm`) | `src/main/recorder-file.js` |
| Biblioteca y Papelera | `src/main/library.js` |
| Panel: fuentes, dispositivos, `MediaRecorder`, biblioteca | `src/renderer/panel/` |
| Cámara flotante | `src/renderer/camera/` |
| Paleta de marca | `src/renderer/theme.css` |

La cámara sale en el video porque se graba la pantalla, donde la ventana flotante ya está visible, igual que en Loom.
La barra de controles y la cuenta regresiva usan protección de contenido, así que Windows las deja fuera del video.

## Limitaciones conocidas

- Si grabas **una sola ventana**, la cámara flotante no sale en el video. Para incluirla, graba la pantalla completa.
- El formato es **WebM**. Algunos reproductores no muestran la duración total; el reproductor de CHELOOM y los navegadores sí lo hacen.
- No graba el audio del sistema, solo el del micrófono.

## Paleta

| Token | Hex |
|---|---|
| Horizon | `#20BEC6` |
| Magenta | `#ED0180` |
| Dusk | `#0C152A` |
| Cloud | `#C9DEE8` |
| Lead | `#9EACB2` |
| Blackout | `#0A0F0F` |
