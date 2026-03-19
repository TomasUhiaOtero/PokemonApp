/**
 * Iconos SVG oficiales de tipos de Pokémon
 * Fuente: https://github.com/duiker101/pokemon-type-svg-icons
 * Licencia: MIT
 */

import { TYPE_COLORS } from '../../lib/constants';

const DEFAULT_TYPE_COLOR = '#6b7280';

// URLs de los SVGs oficiales desde GitHub
const TYPE_ICON_URLS: Record<string, string> = {
  bug: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg',
  dark: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg',
  dragon: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg',
  electric: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg',
  fairy: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg',
  fighting: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg',
  fire: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg',
  flying: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg',
  ghost: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg',
  grass: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg',
  ground: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg',
  ice: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg',
  normal: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg',
  poison: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg',
  psychic: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg',
  rock: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg',
  steel: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg',
  water: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg',
};

interface TypeIconProps {
  type: string;
  size?: number;
  color?: string;
}

// Componente que renderiza el icono SVG del tipo
export function TypeIcon({ type, size = 14, color }: TypeIconProps) {
  const iconUrl = TYPE_ICON_URLS[type];
  const iconColor = color || TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;

  if (!iconUrl) {
    return null;
  }

  return (
    <img
      src={iconUrl}
      alt={type}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.3))`,
      }}
    />
  );
}

// Componente con icono SVG tintado con el color del tipo
export function TypeIconTinted({ type, size = 14 }: TypeIconProps) {
  const iconUrl = TYPE_ICON_URLS[type];
  const iconColor = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;

  if (!iconUrl) {
    return null;
  }

  return (
    <img
      src={iconUrl}
      alt={type}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        // Aplica el color del tipo usando filter
        filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.3)) brightness(0) saturate(100%) invert(37%) sepia(96%) saturate(1500%) hue-rotate(deg) saturate(${getFilterSaturate(iconColor)})`,
      }}
    />
  );
}

// Helper para calcular el filter de color basado en el hex
function getFilterSaturate(hex: string): number {
  // Los SVGs son blancos, así que necesitamos invertir y aplicar el color
  // Este es un aproximado - para colores exactos necesitaríamos conversión real
  return 1;
}

// Componente simple que muestra el icono con un color específico
// Usa CSS mix-blend-mode para tintar
export function TypeIconSimple({ type, size = 14 }: TypeIconProps) {
  const iconUrl = TYPE_ICON_URLS[type];
  const iconColor = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;

  if (!iconUrl) {
    return null;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 4,
        height: size + 4,
        borderRadius: '50%',
        backgroundColor: iconColor,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
      }}
    >
      <img
        src={iconUrl}
        alt={type}
        style={{
          width: size - 2,
          height: size - 2,
          filter: 'brightness(0) invert(1)',
        }}
      />
    </span>
  );
}
