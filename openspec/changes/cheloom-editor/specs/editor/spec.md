# Spec — editor (nuevo dominio)

## Actor-Goal List
| Actor | Meta | Nivel |
|---|---|---|
| Creadora | Quitar partes de una grabación y exportar el resultado | Usuario |
| Creadora | Reordenar o ajustar fragmentos | Subfunción |

## Requirements
- R1. La Biblioteca MUST ofrecer **Editar** para la grabación seleccionada; abre el editor en su propia ventana.
- R2. Al abrir, el editor MUST mostrar un único fragmento con la grabación completa.
- R3. **Dividir** (botón o `S`) MUST partir el fragmento bajo el cabezal en dos. MUST NOT crear fragmentos de menos de 0,1 s.
- R4. **Eliminar** (botón o `Supr`) MUST quitar el fragmento seleccionado; los siguientes MUST correrse para no dejar huecos.
- R5. Arrastrar el borde de un fragmento MUST recortarlo, sin salir de la grabación original y sin bajar de 0,1 s.
- R6. Arrastrar un fragmento MUST permitir moverlo a otra posición.
- R7. La vista previa MUST reproducir la secuencia editada (saltando lo eliminado).
- R8. MUST existir deshacer (`Ctrl+Z`) y rehacer (`Ctrl+Y` / `Ctrl+Shift+Z`).
- R9. **Exportar** MUST generar un MP4 (H.264 + AAC) nuevo en la carpeta de grabaciones, sin modificar el original,
  con nombre `<original> (editado).mp4` (con sufijo numérico si ya existe).
- R10. La exportación MUST mostrar progreso y poder cancelarse; cancelar MUST NOT dejar archivo.
- R11. El video exportado MUST durar la suma de los fragmentos (±1 cuadro).
- R12. Si la grabación no tiene audio, la exportación MUST funcionar sin audio.
- R13. Al cerrar el editor con cambios sin exportar, SHOULD pedir confirmación.

## UC-9 Quitar una parte del video
**Ruta:** Panel → *Biblioteca* → grabación → **Editar** → ventana *Editor*.
1. La creadora mueve el cabezal al inicio de la parte que sobra y pulsa **Dividir**.
2. Mueve el cabezal al final de esa parte y pulsa **Dividir**.
3. Selecciona el fragmento del medio y pulsa **Eliminar**; los fragmentos restantes quedan pegados.
4. Reproduce para revisar y pulsa **Exportar**.
5. El sistema muestra el progreso y, al terminar, el video nuevo aparece en la Biblioteca.

**Extensiones**
- 3a. Se equivocó: pulsa **Deshacer** y el fragmento vuelve.
- 4a. Pulsa **Cancelar** durante la exportación: no queda archivo.
- 5a. FFmpeg falla: se muestra el error y la edición se conserva para reintentar.
