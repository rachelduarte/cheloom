# Proposal — cheloom-color-marco

## Intent
Poder elegir el color del marco de la cámara flotante.

## Scope
**Dentro**: colores de la paleta (Degradado Horizon→Magenta, Atardecer Cloud→Magenta→negro, Horizon, Magenta,
Cloud, Lead, Blackout), **Sin marco** y **Personalizado** (selector de color libre). Se recuerda entre sesiones.
**Diferido**: grosor del marco, marcos animados.

## Approach
Lógica pura en `src/shared/frames.js` (lista de marcos y CSS resultante, con validación del hex). El panel muestra
muestras de color; main lo guarda y lo envía a la cámara junto con la forma.

## Risks
Bajo. Un hex inválido en settings → se usa el Degradado.

## Rollback
Revertir el commit; el ajuste `frame` en settings se ignora.
