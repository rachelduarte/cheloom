# Spec — library (nuevo dominio)

## Actor-Goal List
| Actor | Meta | Nivel |
|---|---|---|
| Creadora | Ver y reproducir sus grabaciones | Usuario |
| Creadora | Llegar al archivo para compartirlo o borrarlo | Subfunción |

## Requirements
- R1. La biblioteca MUST listar los `.webm` de `%USERPROFILE%\Videos\CHELOOM`, del más reciente al más antiguo,
  con nombre, fecha y tamaño.
- R2. Al seleccionar un video, la app MUST reproducirlo en el panel.
- R3. La app MUST ofrecer **Mostrar en carpeta** y **Abrir carpeta**.
- R4. **Eliminar** MUST mover el archivo a la Papelera de reciclaje (no borrado permanente), con confirmación.
- R5. La lista MUST refrescarse al terminar una grabación.

## UC-5 Revisar una grabación
**Ruta:** Panel → pestaña *Biblioteca* → fila del video → reproductor.
1. La creadora abre la pestaña *Biblioteca*.
2. Selecciona un video de la lista.
3. El reproductor lo carga y reproduce.
4. Pulsa **Mostrar en carpeta**; se abre el Explorador con el archivo marcado.

**Extensiones**
- 1a. No hay grabaciones: se muestra un estado vacío con botón **Grabar ahora**.
- 4a. Pulsa **Eliminar** y confirma: el archivo va a la Papelera y desaparece de la lista.
