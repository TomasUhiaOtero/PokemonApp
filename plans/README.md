# Planes de mejora de motion — PokemonApp

Generados por una auditoría de animación sobre el commit `c22b471`. Cada plan es
autocontenido: incluye el código actual, los valores exactos de destino, los
límites de alcance y cómo verificarlo. Un agente sin contexto de la auditoría
debería poder ejecutar cualquiera de ellos leyendo solo su archivo.

## Planes

| # | Título | Severidad | Categoría | Estado |
|---|---|---|---|---|
| [001](001-motion-tokens.md) | Introducir tokens de motion y acotar `transition-all` | MEDIUM | Cohesión y tokens | **DONE** |
| [002](002-reduced-motion-framer.md) | Hacer que `prefers-reduced-motion` afecte al motion de framer-motion | **HIGH** | Accesibilidad | **DONE** |
| [003](003-no-animar-paginacion-teclado.md) | Quitar la transición de página de la Pokédex | **HIGH** | Propósito y frecuencia | **DONE** |
| [004](004-gradiente-fondo-sin-repintar.md) | Dejar de animar `background` a pantalla completa | **HIGH** | Rendimiento | **DONE** |

## Orden recomendado

**001 → 003 → 004 → 002**

El razonamiento:

1. **001 primero** porque define las curvas y el presupuesto de duración que el
   resto da por supuestos. Ejecutarlo después obligaría a revisar dos veces los
   mismos archivos. Ojo con su radio de acción: redefine `--ease-out` y
   `--ease-in-out`, que en Tailwind v4 alimentan las utilidades `ease-*` de toda
   la app.
2. **003 antes que 002** porque 003 **elimina** el bloque de `PokemonGrid` que
   002 tendría que adaptar. En ese orden, el paso 4 de 002 se salta sin más.
3. **004 es independiente**: toca un solo archivo y ningún otro plan lo roza.
   Puede ejecutarse en cualquier momento, pero conviene antes que 002 para medir
   la ganancia de rendimiento por separado y no atribuirle a 002 lo que hizo 004.
4. **002 al final** porque es el que más superficie toca y se beneficia de que
   el resto ya esté estable.

## Dependencias

| Plan | Depende de | Motivo |
|---|---|---|
| 001 | — | Ninguna |
| 002 | 003 (blanda) | Si 003 ya corrió, el paso 4 de 002 desaparece |
| 003 | — | Ninguna |
| 004 | — | Ninguna |

## Hallazgos auditados que **no** se convirtieron en plan

Quedaron fuera por decisión del usuario, no por estar descartados:

- **MEDIUM** — `Tooltip.tsx:107`: escala desde el centro en vez de desde su
  trigger. No hay `transform-origin` en ningún archivo del proyecto.
- **MEDIUM** — `PokemonDetail.tsx:277` y `PokemonGrid.tsx:97`: las barras de
  stats y de progreso animan `width`, una propiedad de layout. Deberían usar
  `scaleX` con `transform-origin: left`.
- **MEDIUM** — `PokemonCard.tsx:49` y `:87`: 12 efectos de hover con movimiento
  sin gate `@media (hover: hover)`; en táctil se disparan al tocar.
- **MEDIUM** — `ShinyText.tsx:59`: animación WAAPI infinita sobre
  `background-position` (propiedad de paint) que además no se cancela en el
  cleanup del efecto.
- **LOW** — `PokemonCard.tsx:45`: las 10 tarjetas de cada página entran a la vez,
  sin stagger de 30-80ms.

### Oportunidades no cubiertas

- El cambio de generación sustituye la rejilla de golpe: es el corte más brusco
  de la app y no tiene ninguna transición que lo explique.
- Marcar un favorito es un momento de recompensa sin acuse visual propio más allá
  del `whileTap` de escala.
- Activar un filtro de tipo refiltra la rejilla al instante, sin nada que conecte
  el chip pulsado con el resultado.

## Nota

Un dato colateral de la auditoría: `three` está en `package.json` pero no se
importa en ningún archivo de `src/`. Y `motion` y `framer-motion` conviven siendo
esencialmente el mismo paquete. No es motion mal hecho, así que no hay plan para
ello, pero pesa en el bundle.
