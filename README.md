<p align="center">
  <img src="build/icon.png" width="120" alt="Ícono de CHELOOM" />
</p>

<h1 align="center">CHELOOM</h1>

<p align="center">
  Grabadora de pantalla y cámara para el escritorio, al estilo Loom, con marca propia.<br />
  Todo es local: no sube nada a la nube.
</p>

---

## Índice

1. [Qué hace](#qué-hace)
2. [Instalación](#instalación)
3. [Cómo abrirla](#cómo-abrirla)
4. [Cómo grabar](#cómo-grabar)
5. [Calidad de video y YouTube](#calidad-de-video-y-youtube)
6. [Dónde quedan los videos](#dónde-quedan-los-videos)
7. [Limitaciones conocidas](#limitaciones-conocidas)
8. [Desarrollo](#desarrollo)
9. [Paleta de marca](#paleta-de-marca)

---

## Qué hace

| Función | Detalle |
|---|---|
| **Grabar** | Pantalla completa o una ventana, con el audio del micrófono |
| **Cámara flotante** | Siempre visible, en tres formas: **burbuja**, **cuadrado** y **rectángulo 16:9**. Se arrastra con el mouse y se redimensiona desde el círculo magenta de la esquina. Recuerda su forma, tamaño y posición |
| **Color del marco** | Colores de la paleta, dos degradados, **Sin marco** o un color **Personalizado** |
| **Controles** | Cuenta regresiva de 3 s · pausar / reanudar · detener · descartar. La barra no aparece en el video |
| **Calidad** | Presets **YouTube**, **Máxima** y **Liviana**. Por defecto MP4 H.264 a 60 fps y resolución nativa |
| **Biblioteca** | Lista, reproductor, *Mostrar en carpeta*, *Abrir carpeta* y *Eliminar* (manda el archivo a la Papelera) |

---

## Instalación

1. Ejecuta **`dist\CHELOOM Setup 0.2.0.exe`**.
2. Se instala sola, sin pedir permisos de administrador, en `%LOCALAPPDATA%\Programs\cheloom`.
3. Quedan creados dos accesos directos: uno en el **Escritorio** y otro en el **menú Inicio**.

> **Aviso de Windows SmartScreen.** El instalador no está firmado con un certificado de código, así
> que Windows puede mostrar *"Windows protegió tu PC"*. Pulsa **Más información → Ejecutar de todas formas**.
> Es esperable en una app propia sin firmar.

**Desinstalar:** Configuración → Aplicaciones → Aplicaciones instaladas → CHELOOM → Desinstalar.
Tus grabaciones **no** se borran al desinstalar.

---

## Cómo abrirla

| Forma | Acción |
|---|---|
| ⌨️ **Atajo de teclado** | **`Ctrl` + `Alt` + `C`** desde cualquier app |
| 🖥️ Escritorio | Doble clic en el ícono **CHELOOM** |
| 🔎 Menú Inicio | Escribe *CHELOOM* |

Si CHELOOM ya está abierta, cualquiera de estas formas trae el panel al frente en lugar de abrir otra copia.

> El atajo está guardado en el acceso directo del **menú Inicio**. Si lo borras o lo mueves, el atajo deja
> de funcionar. Puedes cambiarlo en *clic derecho → Propiedades → Tecla de método abreviado*.

---

## Cómo grabar

1. En la pestaña **Grabar**, elige qué grabar: **Pantallas** o **Ventanas**.
2. Elige la **cámara**, su **forma** y el **micrófono**.
3. Elige la **calidad**. Debajo del selector verás el resultado esperado, por ejemplo
   `MP4 · H.264 · 1440p · 60 fps · 24 Mbps`.
4. Pulsa **Empezar a grabar**. Corre una cuenta regresiva de 3 s; **Esc** la cancela.
5. Usa la barra flotante para **pausar**, **detener** o **descartar**.
6. Al detener, el video se abre solo en la pestaña **Biblioteca**.

### Color del marco

En **Grabar → Color del marco**, pulsa una muestra. El cambio se ve al instante en la cámara flotante y
queda guardado para la próxima vez.

| Opción | Color |
|---|---|
| **Degradado** *(por defecto)* | Horizon → Magenta |
| **Atardecer** | Cloud → Magenta → Blackout |
| **Horizon** · **Magenta** · **Cloud** · **Lead** · **Blackout** | Colores sólidos de la paleta |
| **Sin marco** | La cámara queda sin borde |
| **Personalizado** (`+`) | Abre el selector de color de Windows; elige cualquier color |

El marco forma parte del video, porque se graba tal como se ve en pantalla.

**Cambiar la forma de la cámara mientras grabas:** pasa el cursor sobre la cámara y elige entre burbuja,
cuadrado o rectángulo. El cambio se ve en el video en ese mismo momento.

---

## Calidad de video y YouTube

### Presets

| Preset | Formato | FPS | Bitrate de video | Audio | Para qué |
|---|---|---|---|---|---|
| **YouTube** *(por defecto)* | MP4 · H.264 + AAC | 60 | 24 Mbps | 192 kbps | Publicar en YouTube |
| **Máxima** | MP4 · H.264 + AAC | 60 | 40 Mbps | 256 kbps | Editar después o archivar |
| **Liviana** | WebM · VP9 + Opus | 30 | 8 Mbps | 128 kbps | Compartir rápido, archivos chicos |

Todos graban a la **resolución nativa** de la pantalla elegida, sin reescalar.

### Por qué estos valores

- **Resolución:** en esta máquina la pantalla es de **2560×1440**, así que los videos salen en **1440p**.
  Subir en 1440p tiene una ventaja extra: YouTube procesa esos videos con códecs de mayor calidad (VP9/AV1),
  y eso mejora la imagen **incluso para quien los ve en 1080p**.
- **Bitrate:** YouTube recomienda unos **24 Mbps para 1440p a 60 fps**. Como YouTube vuelve a comprimir
  todo lo que se sube, conviene darle un archivo con margen de calidad.
- **60 fps:** el movimiento del mouse y los desplazamientos se ven fluidos, algo que en tutoriales se nota.
- **MP4 H.264 + AAC:** es el formato que YouTube y cualquier editor (CapCut, Premiere, DaVinci) aceptan
  sin problemas. Si el equipo tiene codificador de hardware, Chromium lo usa y la grabación pesa menos en la CPU.

**Peso aproximado del archivo:** el preset YouTube genera hasta ~180 MB por minuto, y Máxima hasta ~300 MB.
Con contenido estático (poco movimiento en pantalla) los archivos suelen salir bastante más livianos.

### Recomendaciones para que se vea mejor en YouTube

- Graba la **pantalla completa**, no una ventana suelta, para que la cámara salga y se mantenga la resolución.
- Si tienes texto pequeño, sube el zoom de la app que vas a mostrar (125–150 %); en el celular se lee mejor.
- Para el audio, un micrófono externo cerca de la boca vale más que cualquier ajuste de bitrate.
- Al subir, YouTube puede tardar un rato en mostrar 1440p: primero procesa las resoluciones bajas.

### Evidencia técnica

Lo que se comprobó en esta máquina (Electron 44.9.0 / Chromium 152, 19-10-2026) con `MediaRecorder.isTypeSupported`:

| Formato | Soportado |
|---|---|
| `video/mp4;codecs=avc1.640033,mp4a.40.2` (H.264 High + AAC) | ✅ |
| `video/mp4;codecs=av01,opus` (AV1) | ✅ |
| `video/webm;codecs=vp9,opus` | ✅ |
| `video/mp4;codecs=hvc1,opus` (H.265) | ❌ |

Si un equipo no soporta MP4, CHELOOM cae automáticamente a WebM VP9, y el panel lo indica antes de grabar.

---

## Dónde quedan los videos

```
%USERPROFILE%\Videos\CHELOOM\CHELOOM AAAA-MM-DD HH-mm-ss.mp4
```

Mientras grabas, el archivo se escribe a disco cada segundo, con extensión `.part`. Si la app se cierra a
mitad de una grabación, lo grabado hasta ese momento se conserva.

---

## Limitaciones conocidas

- Si grabas **una sola ventana**, la cámara flotante no sale en el video (el panel lo avisa).
- Graba el audio del **micrófono**, no el del sistema.
- El MP4 que produce el navegador es **fragmentado y de cuadros variables**. YouTube lo acepta sin
  problema; algún editor antiguo podría pedir convertirlo antes.
- Los atajos solo **abren** la app; todavía no hay atajos globales para empezar o detener la grabación.
- El instalador no está firmado (ver el aviso de SmartScreen en [Instalación](#instalación)).

---

## Desarrollo

```bash
npm install
npm start
```

| Comando | Qué hace |
|---|---|
| `npm start` | Abre CHELOOM en modo desarrollo |
| `npm test` | Pruebas de la lógica pura: formas, colores del marco, formato y presets de calidad |
| `npm run icon` | Regenera `build/icon.png` y `src/assets/icon.png` con la paleta |
| `npm run dist` | Genera el instalador en `dist\` |

### Estructura

| Pieza | Archivo |
|---|---|
| Ventanas (panel, cámara, barra, cuenta regresiva) | `src/main/windows.js` |
| Canales IPC y flujo de grabación | `src/main/ipc.js` |
| Escritura a disco por fragmentos (`.part` → `.mp4`/`.webm`) | `src/main/recorder-file.js` |
| Biblioteca y Papelera | `src/main/library.js` |
| Preferencias de la usuaria | `src/main/settings.js` |
| Presets de calidad y elección de códec | `src/shared/quality.js` |
| Formas de la cámara | `src/shared/shapes.js` |
| Colores del marco | `src/shared/frames.js` |
| Panel: fuentes, dispositivos, `MediaRecorder`, biblioteca | `src/renderer/panel/` |
| Cámara flotante | `src/renderer/camera/` |
| Paleta de marca | `src/renderer/theme.css` |
| Atajo Ctrl+Alt+C en el instalador | `build/installer.nsh` |

### Cómo funciona la composición

La cámara sale en el video porque CHELOOM graba la pantalla, donde la ventana flotante ya está visible,
igual que hace Loom. La barra de controles y la cuenta regresiva usan *content protection*, así que Windows
las excluye de la captura.

### Especificaciones

Los cambios se planifican con SDD en [`openspec/changes/`](openspec/changes):

- [`cheloom-mvp`](openspec/changes/cheloom-mvp): grabación, cámara flotante y biblioteca.
- [`cheloom-calidad-instalador`](openspec/changes/cheloom-calidad-instalador): calidad para YouTube e instalador.
- [`cheloom-color-marco`](openspec/changes/cheloom-color-marco): color del marco de la cámara.

---

## Paleta de marca

| Token | Hex | Uso |
|---|---|---|
| Horizon | `#20BEC6` | Acentos, botón detener, foco |
| Magenta | `#ED0180` | Grabando, tirador de tamaño |
| Dusk | `#0C152A` | Superficies |
| Cloud | `#C9DEE8` | Texto |
| Lead | `#9EACB2` | Texto secundario |
| Blackout | `#0A0F0F` | Fondo |
| Degradado | Cloud → Magenta → negro | Botón *Empezar a grabar* |
