# 002 — Hacer que `prefers-reduced-motion` afecte de verdad al motion de framer-motion

- **Status**: DONE (aplicado sobre c22b471)
- **Commit**: c22b471
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 3-4 archivos

## Problem

El proyecto declara soporte de movimiento reducido, pero solo alcanza a CSS:

```css
/* src/index.css:126-134 — actual */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Framer-motion **no anima con transiciones ni con `@keyframes` de CSS**: escribe `transform` y `opacity` inline por JavaScript, fotograma a fotograma. Esa regla no lo toca. Resultado: un usuario que pidió menos movimiento sigue recibiendo, a pleno:

- Las ~43 animaciones infinitas de `src/components/layout/AnimatedBackground.tsx` (20 partículas, 15 burbujas, 4 líneas de energía, orbes y el glow central), todas con `repeat: Infinity`.
- El desplazamiento de las tarjetas al entrar y al hacer hover (`src/components/ui/PokemonCard.tsx:45-49`).
- La transición de página del grid (`src/components/features/PokemonGrid.tsx:317-322`).

Además la regla actual es de martillo: con `0.01ms !important` sobre `*` también elimina el feedback de opacidad y color, que **sí** conviene conservar. Movimiento reducido significa menos movimiento y más suave, no cero.

## Target

Framer-motion expone `useReducedMotion()`, que lee la misma media query y re-renderiza al cambiar. La regla es: **conservar opacidad y color, eliminar desplazamiento y escala**.

```jsx
/* target — patrón a aplicar */
import { motion, useReducedMotion } from 'framer-motion';

const reduce = useReducedMotion();

<motion.div
  initial={{ opacity: 0, y: reduce ? 0 : 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: reduce ? 0.15 : 0.3, ease: 'easeOut' }}
  whileHover={reduce ? undefined : { y: -8, scale: 1.02 }}
/>
```

Para el fondo decorativo, que es puro adorno y el mayor consumidor de CPU, el objetivo es **no renderizar las capas animadas**:

```jsx
/* target — src/components/layout/AnimatedBackground.tsx */
const reduce = useReducedMotion();
// ...
{!reduce && BUBBLE_CONFIG.map((config) => (
  <LightBubble key={`bubble-${config.id}`} {...config} />
))}
```

Y el bloque CSS deja de ser un martillo:

```css
/* target — src/index.css:126 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 120ms !important;
  }
}
```

## Repo conventions to follow

- Todos los componentes con motion importan de `'framer-motion'` (no de `'motion'`, aunque ambos paquetes estén instalados). Mantener ese import.
- Los componentes son funciones con hooks; `useReducedMotion()` va con el resto de hooks, al principio del cuerpo.
- Exemplar de estructura de componente animado a imitar: `src/components/ui/PokemonCard.tsx:18-52`.

## Steps

1. En `src/components/layout/AnimatedBackground.tsx`, importar `useReducedMotion` desde `'framer-motion'`, llamarlo en `AnimatedBackground()` (línea ~220) y envolver en `{!reduce && ...}` los tres `.map()` de burbujas, líneas y partículas, más el `motion.div` del glow central (línea ~240). Dejar visibles el fondo sólido, `GridPattern` y los gradientes estáticos: la escena sigue viéndose, pero quieta.
2. En el mismo archivo, hacer que `GlowOrbs` reciba el estado reducido (o llame al hook) y, si está activo, renderice los orbes **sin** la prop `animate`.
3. En `src/components/ui/PokemonCard.tsx`, aplicar el patrón del Target al `motion.div` de las líneas 45-49: `y` a 0 en `initial` y `whileHover` a `undefined` cuando `reduce` sea true. Dejar la opacidad intacta.
4. En `src/components/features/PokemonGrid.tsx`, en el `motion.div` de las líneas 317-322, poner `y: 0` en `initial` y `exit` cuando `reduce` sea true, conservando el fundido de opacidad. **Nota**: si el plan 003 ya se ejecutó, ese bloque habrá desaparecido; en ese caso, saltar este paso.
5. En `src/index.css:126-134`, sustituir `transition-duration: 0.01ms !important;` por `transition-duration: 120ms !important;` para conservar el feedback de color y opacidad.

## Boundaries

- Do NOT eliminar animaciones para los usuarios **sin** movimiento reducido: este plan solo añade la rama alternativa.
- Do NOT tocar el modal de `src/components/ui/PokemonDetail.tsx`: su entrada `scale: 0.9 -> 1` es suave y está fuera de alcance aquí.
- Do NOT añadir dependencias: `useReducedMotion` ya viene en framer-motion.
- Do NOT cambiar markup ni estructura más allá de los envoltorios condicionales indicados.
- Si un paso no encaja con el código que encuentres (drift desde c22b471), PARA y reporta.

## Verification

- **Mechanical**: `npm run typecheck` sin errores; `npm run lint` sin errores; `npm run build` completa.
- **Feel check**: en DevTools > Rendering, activar "Emulate CSS prefers-reduced-motion: reduce" y confirmar:
  - El fondo queda completamente **quieto**: ninguna partícula, burbuja ni línea se mueve.
  - Las tarjetas siguen apareciendo con fundido, pero **sin** desplazamiento vertical, y no se levantan al pasar el ratón.
  - Cambiar de página en la Pokédex funde el contenido sin deslizarlo.
  - El hover de los chips de tipo **sigue** cambiando de color: no debe quedar todo inerte.
  - En la pestaña Performance, grabar 5s con reduced motion activo y confirmar una caída clara de trabajo en el hilo principal frente a la misma grabación sin el flag.
- **Done when**: con reduced motion activo no queda ningún elemento en movimiento en la página, y el feedback de color/opacidad sigue presente.
