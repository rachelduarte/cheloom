; Atajo de teclado Ctrl+Alt+C para abrir cheloom.
; electron-builder ya creó el acceso del menú Inicio; aquí se recrea con el atajo, porque
; electron-builder no expone ese parámetro. Windows solo respeta atajos en accesos del
; Escritorio o del menú Inicio.
!macro customInstall
  CreateShortCut "$newStartMenuLink" "$appExe" "" "$appExe" 0 SW_SHOWNORMAL "CONTROL|ALT|C" "${APP_DESCRIPTION}"
  WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"
!macroend
