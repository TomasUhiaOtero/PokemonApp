# 001 — Introducir tokens de motion y acotar `transition-all`

- **Status**: DONE (aplicado sobre c22b471)
- **Commit**: c22b471
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 9 archivos, cambios pequenos y repetitivos

## Problem

No existe ningun token de easing ni de duracion en el proyecto. Un `grep -rn -- "--ease|--duration" src` devuelve cero resultados. Las curvas son las de serie de Tailwind y de CSS (`ease`, `ease-out`, `easeOut`), que son demasiado debiles para motion deliberado, y las duraciones estan escritas a mano y sin criterio comun (0.2 / 0.3 / 0.5 / 0.6 en framer-motion; `duration-300` / `duration-500` en clases).

Ademas hay 18 usos de `transition: all` / `transition-all`, que animan propiedades no buscadas fuera de la GPU:

```css
/* src/components/ui/TypeFilter.css:3 — actual */
  transition: all 0.2s ease;
```

```css
/* src/components/ui/PokemonDetail.css:86 — actual */
  transition: all 0.2s ease;
```

```jsx
/* src/components/features/GenerationSelector.tsx:28 — actual */
              transition-all duration-300 border cursor-pointer
```

Esto importa porque cada componente decide su propio feel: la app no se mueve como un solo producto, y sin tokens los planes 002-004 no tienen donde apoyarse.

## Target

El bloque `@theme` de `src/index.css` gana tokens de easing. **Nota importante para el executor**: en Tailwind v4 el namespace `--ease-*` alimenta las utilidades `ease-*`, asi que redefinir `--ease-out` y `--ease-in-out` **sustituye la curva de esas utilidades en toda la app**. Eso es lo buscado (las de serie son debiles), pero es un cambio de radio amplio: verificalo visualmente.

```css
/* target — dentro del @theme existente en src/index.css */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Y cada `transition: all` / `transition-all` pasa a nombrar sus propiedades. Presupuesto de duracion: **el motion de UI se queda por debajo de 300ms**.

| Elemento | Duracion |
| --- | --- |
| Feedback de pulsacion | 100-160ms |
| Tooltips, popovers pequenos | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modales, drawers | 200-500ms |

```css
/* target — src/components/ui/TypeFilter.css:3 */
  transition: background-color 200ms var(--ease-out), border-color 200ms var(--ease-out), color 200ms var(--ease-out);
```

```jsx
/* target — src/components/features/GenerationSelector.tsx:28 */
              transition-colors duration-200 ease-out border cursor-pointer
```

## Repo conventions to follow

- Los tokens de tema viven en el bloque `@theme` de `src/index.css:3-13`, que ya contiene `--color-pokemon-red`, `--font-family-display`, etc. Anadir los `--ease-*` **ahi**, al final del bloque. No crear un archivo de tokens nuevo.
- El proyecto usa Tailwind v4 sin `tailwind.config`: toda la configuracion es CSS-first via `@theme`.
- Los estilos de componente sueltos son `src/components/ui/PokemonDetail.css` y `src/components/ui/TypeFilter.css`. El resto es Tailwind en `className`.

## Steps

1. En `src/index.css`, dentro del `@theme` existente (tras `--font-family-body`), anadir las tres lineas `--ease-*` del apartado Target.
2. En `src/components/ui/TypeFilter.css:3`, sustituir `transition: all 0.2s ease;` por la version del Target. Si el selector solo cambia color y borde, listar solo esas propiedades.
3. En `src/components/ui/PokemonDetail.css`, hacer lo mismo en las lineas **86, 108, 321, 520 y 543**. Antes de cada sustitucion, leer el bloque del selector y listar **unicamente** las propiedades que ese selector realmente cambia en su estado `:hover`/`:focus`. No listar propiedades que no cambian.
4. Sustituir `transition-all` por la utilidad acotada en cada uno de estos sitios, anadiendo `ease-out` y una `duration-*` dentro de presupuesto si no la tienen:
   - `src/components/features/CTA.tsx:75`
   - `src/components/features/FeaturesCarousel.tsx:31` y `:176`
   - `src/components/features/Header.tsx:41`
   - `src/components/features/PokemonGrid.tsx:75`, `:114` y `:136`
   - `src/components/features/GenerationSelector.tsx:28`
   - `src/components/ui/StaggeredMenu.tsx:205`, `:217`, `:225` y `:290`
   En la mayoria de estos casos lo que cambia es color de fondo/borde/opacidad y, a veces, `transform`: usar `transition-colors`, `transition-opacity`, `transition-transform` o la combinacion `transition-[background-color,transform]`. Nunca dejar `transition-all`.

## Boundaries

- Do NOT tocar las `transition={{ ... }}` de framer-motion en este plan. Los planes 002, 003 y 004 se ocupan de esas.
- Do NOT cambiar markup ni estructura: solo propiedades de motion y clases de transicion.
- Do NOT anadir dependencias.
- Do NOT tocar `src/components/ui/PokemonDetail.css:558` ni `:598` (`animation: pulse-glow` y `sound-wave`): son animaciones de estado continuo, fuera de alcance.
- Si un paso no encaja con el codigo que encuentres (drift desde el commit c22b471), PARA y reporta en vez de improvisar.

## Verification

- **Mechanical**: `npm run typecheck` sin errores; `npm run lint` sin errores (los warnings preexistentes siguen siendo aceptables); `npm run build` completa.
- **Feel check**: abrir la app y comprobar:
  - Los chips de tipo (`TypeFilter`) cambian de color al pasar el raton sin que el layout se mueva.
  - Los botones de paginacion y el selector de generacion responden de forma mas seca que antes, no mas lenta.
  - En DevTools > Animations, bajar la velocidad al 10% y confirmar que ninguna transicion de UI dura mas de 300ms.
  - Barrer visualmente Hero, carousel, grid y modal buscando algo que se haya vuelto raro: redefinir `--ease-out` afecta a **todas** las utilidades `ease-out` del proyecto.
- **Done when**: `grep -rn "transition-all|transition: all" src` devuelve cero resultados y el `@theme` contiene los tres tokens.
