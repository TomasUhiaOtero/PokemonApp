# 003 — Quitar la transición de página de la Pokédex (acción de teclado, alta frecuencia)

- **Status**: DONE (aplicado sobre c22b471)
- **Commit**: c22b471
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 archivo

## Problem

La rejilla de la Pokédex se pagina con las flechas del teclado mediante un listener global:

```jsx
/* src/components/features/PokemonGrid.tsx:205-217 — actual */
  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage((p) => p + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);
```

Y cada cambio de página pasa por una transición bloqueante:

```jsx
/* src/components/features/PokemonGrid.tsx:316-322 — actual */
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
```

`mode="wait"` obliga a que la salida **termine** antes de que empiece la entrada: 0.3s + 0.3s = unos **600ms de espera por cada pulsación de flecha**, y encima cada `PokemonCard` remonta y corre su propia entrada de 0.3s (`src/components/ui/PokemonCard.tsx:45-48`).

Recorrer una generación son decenas de pulsaciones seguidas. La regla es directa: **las acciones iniciadas con el teclado no animan**. Aquí la animación no explica nada — el contenido se sustituye en el sitio — y solo mete latencia en el bucle más repetido de la app.

## Target

El grid cambia de página de inmediato. Se elimina `AnimatePresence` y la animación de la página; el contenedor pasa a ser un `div` normal:

```jsx
/* target — src/components/features/PokemonGrid.tsx */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pagePokemons.map((pokemon, index) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                index={index}
                isFavorite={isFavorite ? isFavorite(pokemon.id) : false}
                onToggleFavorite={onToggleFavorite}
                onSelect={handleSelectPokemon}
              />
            ))}
          </div>
```

Como las tarjetas dejan de remontar con `key={currentPage}`, tampoco vuelven a correr su entrada en cada página.

## Repo conventions to follow

- `AnimatePresence` se sigue usando y es correcto en `src/components/ui/PokemonDetail.tsx` (modal) y en el `AnimatePresence` de `src/components/features/PokemonGrid.tsx:249`: **no** tocar esos.
- El import `import { motion, AnimatePresence } from 'framer-motion';` de la línea 2 debe quedar sin `AnimatePresence` **solo si** ya no queda ningún uso en el archivo. Comprobarlo antes de editar el import; si el de la línea 249 sigue vivo, dejar el import como está.

## Steps

1. En `src/components/features/PokemonGrid.tsx`, sustituir el bloque `AnimatePresence` + `motion.div` de las líneas 316-336 por el `div` simple del apartado Target, conservando exactamente el mismo `className` y el mismo contenido del `.map()`.
2. Comprobar con `grep -n "AnimatePresence" src/components/features/PokemonGrid.tsx` si queda algún uso. Si no queda ninguno, quitar `AnimatePresence` del import de la línea 2.
3. **Arreglo relacionado, incluido a propósito**: acotar el listener de teclado. Tal como está, las flechas paginan también mientras el usuario escribe en el buscador. Al principio de `handleKeyDown`, ignorar el evento si el foco está en un campo editable:
   ```jsx
   const target = e.target as HTMLElement | null;
   if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
     return;
   }
   ```

## Boundaries

- Do NOT tocar la entrada `whileInView` de `src/components/ui/PokemonCard.tsx`: se conserva para la primera aparición al hacer scroll.
- Do NOT tocar el `AnimatePresence` de la línea 249 ni el del modal de detalle.
- Do NOT cambiar la lógica de paginación, el cálculo de `totalPages` ni `ITEMS_PER_PAGE`.
- Do NOT añadir dependencias.
- Si un paso no encaja con el código que encuentres (drift desde c22b471), PARA y reporta.

## Verification

- **Mechanical**: `npm run typecheck` sin errores; `npm run lint` sin errores; `npm run test:run` con los 2 tests en verde; `npm run build` completa.
- **Feel check**: abrir la Pokédex y comprobar:
  - Mantener pulsada la flecha derecha: las páginas se suceden **al instante**, sin acumular retardo ni parpadeo, y sin que aparezca un hueco vacío entre página y página.
  - Hacer clic en un número de página: el cambio es inmediato.
  - Escribir un nombre en el buscador usando las flechas para mover el cursor dentro del texto: **la página ya no cambia**.
  - En DevTools > Animations, cambiar de página y confirmar que ya no se registra ninguna animación de entrada/salida del contenedor del grid.
- **Done when**: cambiar de página no produce ninguna animación y las flechas no interfieren con el campo de búsqueda.
