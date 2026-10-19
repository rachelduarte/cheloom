// Traduce los errores de getUserMedia a mensajes claros y decide cómo recuperarse. Lógica pura.

const MESSAGES = {
  NotReadableError: 'La cámara está en uso por otra app. Ciérrala y cheloom la tomará sola.',
  AbortError: 'La cámara está en uso por otra app. Ciérrala y cheloom la tomará sola.',
  NotAllowedError: 'Sin permiso de cámara. Revisa Configuración → Privacidad y seguridad → Cámara.',
  SecurityError: 'Sin permiso de cámara. Revisa Configuración → Privacidad y seguridad → Cámara.',
  NotFoundError: 'No se encontró la cámara. ¿Está conectada?',
  OverconstrainedError: 'No se encontró la cámara elegida. ¿Está conectada?',
};

export function cameraErrorMessage(name) {
  return MESSAGES[name] ?? `No se pudo abrir la cámara (${name}).`;
}

// La cámara ocupada puede liberarse: vale la pena reintentar.
export function shouldRetry(name) {
  return name === 'NotReadableError' || name === 'AbortError';
}

// El dispositivo guardado ya no existe (otro USB, otra PC): se prueba la cámara predeterminada.
export function shouldFallBackToDefault(name) {
  return name === 'OverconstrainedError' || name === 'NotFoundError';
}
