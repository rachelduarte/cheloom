# Spec — recording (nuevo dominio)

## Actor-Goal List
| Actor | Meta | Nivel |
|---|---|---|
| Creadora (usuaria) | Grabar un video de pantalla con su voz y su cámara | Usuario |
| Creadora | Pausar, reanudar, detener o descartar una grabación en curso | Subfunción |
| Sistema operativo | Conceder acceso a pantalla, cámara y micrófono | Soporte |

## Requirements
- R1. La app MUST listar las pantallas y ventanas disponibles con miniatura y permitir elegir una.
- R2. La app MUST permitir elegir micrófono (o ninguno) y cámara (o ninguna).
- R3. Al pulsar **Grabar**, la app MUST mostrar una cuenta regresiva de 3 s antes de capturar.
- R4. La grabación MUST producir un único archivo `.webm` (VP9 u otro códec soportado + Opus) en
  `%USERPROFILE%\Videos\CHELOOM`, con nombre `CHELOOM AAAA-MM-DD HH-mm-ss.webm`.
- R5. La barra de grabación MUST mostrar el tiempo transcurrido sin contar las pausas.
- R6. Pausar y reanudar MUST NOT generar archivos separados.
- R7. **Descartar** MUST borrar los datos parciales y no dejar archivo.
- R8. La barra de grabación SHOULD quedar fuera del video (protección de contenido).
- R9. Los datos SHOULD escribirse a disco en fragmentos durante la grabación, no al final.
- R10. Si se elige una ventana (no pantalla), la app SHOULD avisar que la cámara flotante no saldrá.

## UC-1 Grabar un video
**Actor primario:** Creadora · **Precondición:** CHELOOM abierta en el panel.
**Ruta:** Panel → pestaña *Grabar* → tarjeta de fuente → botón **Grabar**.

**Escenario principal**
1. La creadora elige una pantalla en la cuadrícula de fuentes.
2. Elige cámara y micrófono en los desplegables.
3. Pulsa **Grabar**.
4. El panel se oculta y aparece la cuenta regresiva 3-2-1.
5. Comienza la captura; aparece la barra flotante con cronómetro.
6. La creadora pulsa **Detener**.
7. El sistema cierra el archivo, vuelve a mostrar el panel en la pestaña *Biblioteca* con el video
   nuevo seleccionado y listo para reproducir.

**Extensiones**
- 1a. Elige una ventana: el sistema muestra el aviso de R10 y continúa.
- 2a. Elige "Sin cámara": no se abre la ventana flotante de cámara.
- 2b. Elige "Sin micrófono": el video se graba sin audio.
- 3a. El sistema operativo niega el permiso: se muestra un mensaje y el panel queda como estaba.
- 4a. La creadora pulsa **Esc** o *Cancelar* durante la cuenta: no se graba nada y vuelve el panel.

## UC-2 Controlar la grabación
**Ruta:** Barra flotante → botones **Pausar/Reanudar**, **Detener**, **Descartar**.
1. La creadora pulsa **Pausar**; el cronómetro se congela y el botón cambia a **Reanudar**.
2. Pulsa **Reanudar**; la captura continúa en el mismo archivo.
3. Pulsa **Detener** → UC-1 paso 7.

**Extensiones**
- 3a. Pulsa **Descartar** y confirma: se borran los datos parciales (R7) y vuelve el panel.
- 3b. Cierra la app durante la grabación: el archivo parcial se conserva como `.webm`.
