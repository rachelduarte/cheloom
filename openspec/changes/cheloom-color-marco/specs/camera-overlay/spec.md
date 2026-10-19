# Spec — camera-overlay (delta)

## Requirements
- R10. La creadora MUST poder elegir el color del marco entre: Degradado, Atardecer, Horizon, Magenta, Cloud,
  Lead, Blackout, Sin marco y Personalizado.
- R11. **Personalizado** MUST aceptar cualquier color `#RRGGBB`; un valor inválido MUST caer en Degradado.
- R12. **Sin marco** MUST mostrar la cámara sin borde.
- R13. El color elegido MUST verse al instante en la cámara flotante y SHOULD recordarse entre sesiones.

## UC-8 Cambiar el color del marco
**Ruta:** Panel → *Grabar* → **Color del marco** → muestra de color (o **Personalizado** → selector).
1. La creadora pulsa la muestra **Magenta**.
2. El marco de la cámara flotante cambia a Magenta.

**Extensiones**
- 1a. Pulsa **Personalizado** y elige un color: el marco toma ese color.
- 1b. Pulsa **Sin marco**: la cámara queda sin borde.
