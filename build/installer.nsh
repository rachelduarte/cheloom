; Accesos directos de cheloom.
; - El del menú Inicio se recrea con el atajo de teclado Ctrl+Alt+C, porque electron-builder no expone ese
;   parámetro. Windows solo respeta atajos en accesos del Escritorio o del menú Inicio.
; - Se borran antes de crearlos: al actualizar desde una versión llamada "CHELOOM", Windows conserva el
;   nombre viejo en mayúsculas (un cambio solo de mayúsculas no renombra el archivo).
!macro customInstall
  Delete "$newStartMenuLink"
  CreateShortCut "$newStartMenuLink" "$appExe" "" "$appExe" 0 SW_SHOWNORMAL "CONTROL|ALT|C" "${APP_DESCRIPTION}"
  WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"

  ${if} ${FileExists} "$newDesktopLink"
    Delete "$newDesktopLink"
    CreateShortCut "$newDesktopLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
    WinShell::SetLnkAUMI "$newDesktopLink" "${APP_ID}"
  ${endIf}
!macroend
