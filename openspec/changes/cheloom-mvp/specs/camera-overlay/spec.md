# Spec — camera-overlay (nuevo dominio)

## Actor-Goal List
| Actor | Meta | Nivel |
|---|---|---|
| Creadora | Verse en una cámara flotante con la forma que prefiera | Usuario |
| Creadora | Mover y redimensionar la cámara sobre cualquier app | Subfunción |

## Requirements
- R1. La cámara MUST mostrarse en una ventana flotante sin marco, transparente y siempre visible.
- R2. La cámara MUST ofrecer tres formas: **burbuja** (círculo), **cuadrado** (1:1, esquinas
  redondeadas) y **rectángulo** (16:9, esquinas redondeadas).
- R3. Al cambiar de forma, la ventana MUST ajustar su proporción conservando su área aproximada.
- R4. La ventana MUST poder arrastrarse a cualquier punto de la pantalla.
- R5. La ventana MUST poder redimensionarse desde una esquina, manteniendo la proporción de la forma,
  entre un mínimo de 120 px y un máximo de 720 px de lado mayor.
- R6. La imagen SHOULD verse en espejo por defecto y MAY desactivarse.
- R7. El borde MUST usar el degradado de marca (Horizon → Magenta).
- R8. La forma y el tamaño elegidos SHOULD recordarse entre sesiones.
- R9. Los controles de forma SHOULD aparecer solo al pasar el cursor, para no ensuciar el video.

## UC-3 Elegir la forma de la cámara
**Ruta:** Panel → *Grabar* → selector **Forma** (Burbuja · Cuadrado · Rectángulo), o
Cámara flotante → hover → botones de forma.
1. La creadora elige una cámara: aparece la ventana flotante en la esquina inferior izquierda.
2. Elige **Rectángulo** en el selector.
3. La ventana cambia a 16:9 y el video se ajusta sin deformarse (recorte `cover`).

**Extensiones**
- 1a. La cámara está en uso por otra app: la ventana muestra "Cámara no disponible".
- 2a. Cambia la forma desde la propia cámara flotante: el panel refleja la misma forma.

## UC-4 Mover y redimensionar la cámara
1. La creadora arrastra la cámara a otra esquina.
2. Arrastra el tirador de la esquina inferior derecha.
3. La ventana crece manteniendo la proporción y respetando R5.
