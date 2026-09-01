# 004 — Dejar de animar `background` a pantalla completa en `AnimatedGradient`

- **Status**: DONE (aplicado sobre c22b471)
- **Commit**: c22b471
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 archivo

## Problem

`AnimatedGradient` anima la propiedad `background` — cadenas completas de `radial-gradient` — sobre un elemento que cubre todo el viewport, en bucle infinito:

```jsx
/* src/components/layout/AnimatedBackground.tsx:146-164 — actual */
function AnimatedGradient() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background: [
          'radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 20%, rgba(234, 179, 8, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(234, 179, 8, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        ],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
```

`background` es una propiedad de **paint**: no se puede componer en la GPU. El navegador tiene que reinterpolar dos gradientes radiales y repintar el viewport entero en cada fotograma, para siempre, en un elemento que además vive detrás de todo el contenido (`zIndex: -1`). Es el trabajo más caro de la página y nadie lo mira directamente.

Solo deben animarse `transform` y `opacity`.

## Target

Renderizar los tres estados del gradiente como tres capas estáticas superpuestas y **fundir su opacidad**, que sí es componible. Cada capa mantiene su gradiente fijo en `style`; solo cambia `opacity`, desfasada en el tiempo para que el ciclo total siga durando 25s.

```jsx
/* target — src/components/layout/AnimatedBackground.tsx */
const GRADIENT_LAYERS = [
  'radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
  'radial-gradient(ellipse at 80% 20%, rgba(234, 179, 8, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
  'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(234, 179, 8, 0.08) 0%, transparent 50%)',
];

function AnimatedGradient() {
  return (
    <>
      {GRADIENT_LAYERS.map((background, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{ background, willChange: 'opacity' }}
          animate={{ opacity: [1, 0, 0, 1] }}
          transition={{
            duration: 25,
            times: [0, 0.33, 0.66, 1],
            delay: -(i * (25 / 3)),
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </>
  );
}
```

Los valores de color son **exactamente** los tres primeros del array actual (el cuarto es una repetición del primero para cerrar el ciclo y ya no hace falta: el `repeat` lo cierra solo).

## Repo conventions to follow

- El archivo ya declara sus configuraciones de animación como constantes de módulo en mayúsculas, calculadas una vez: `PARTICLE_CONFIG`, `BUBBLE_CONFIG`, `LINE_CONFIG` (`src/components/layout/AnimatedBackground.tsx:69-105`). `GRADIENT_LAYERS` debe seguir ese patrón y colocarse junto a ellas.
- El archivo ya usa delays negativos para desfasar animaciones en bucle, p. ej. `delay: -(i * 2)` en `PARTICLE_CONFIG` y `delay: -(i * 1.5)` en `BUBBLE_CONFIG`. Imitar esa técnica.
- Todos los componentes internos del archivo son funciones no exportadas declaradas antes de `AnimatedBackground()`.

## Steps

1. En `src/components/layout/AnimatedBackground.tsx`, añadir la constante `GRADIENT_LAYERS` junto al resto de constantes de configuración (después de `LINE_CONFIG`, sobre la línea 105), con los tres gradientes del apartado Target copiados literalmente.
2. Sustituir el cuerpo de `AnimatedGradient` (líneas 146-164) por la versión del Target.
3. No cambiar dónde se invoca `<AnimatedGradient />` (línea ~228): sigue en el mismo sitio del árbol.

## Boundaries

- Do NOT tocar `GridPattern`, `GlowOrbs`, `FloatingParticle`, `EnergyLine` ni `LightBubble` en este plan.
- Do NOT cambiar los colores, las opacidades ni las posiciones de los gradientes: el aspecto debe ser indistinguible del actual.
- Do NOT reducir la duración de 25s.
- Do NOT añadir dependencias.
- Si un paso no encaja con el código que encuentres (drift desde c22b471), PARA y reporta.

## Verification

- **Mechanical**: `npm run typecheck` sin errores; `npm run lint` sin errores; `npm run build` completa.
- **Feel check**:
  - Mirar el fondo un ciclo completo (25s) y confirmar que la deriva de color se ve **igual** que antes: sin cortes, sin saltos al cerrar el bucle, sin que ninguna capa desaparezca de golpe.
  - En DevTools > Performance, grabar 10s con la página quieta. Comparar con una grabación previa: el tiempo en **Painting** (morado) debe caer de forma clara. Si sigue igual, la capa no se está componiendo — revisar que ningún ancestro fuerce repintado.
  - En DevTools > Rendering, activar "Paint flashing" y confirmar que el fondo **ya no parpadea en verde** de forma continua.
- **Done when**: `grep -n "background: \[" src/components/layout/AnimatedBackground.tsx` no devuelve nada, y Paint flashing deja de marcar el fondo en reposo.
