export const TYPE_COLORS: Record<string, string> = {
  fire: '#ef4444',
  water: '#3b82f6',
  grass: '#22c55e',
  electric: '#eab308',
  psychic: '#ec4899',
  ice: '#06b6d4',
  dragon: '#8b5cf6',
  dark: '#1e293b',
  fairy: '#f472b6',
  normal: '#9ca3af',
  bug: '#84cc17',
  fighting: '#dc2626',
  flying: '#a78bfa',
  ground: '#d97706',
  rock: '#78716c',
  steel: '#94a3b8',
  poison: '#a855f7',
  ghost: '#6366f1',
};

export const POKEMON_TYPES = [
  'all',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'normal',
  'bug',
  'fighting',
  'flying',
  'ground',
  'rock',
  'steel',
  'poison',
  'ghost',
] as const;

export const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const POKEMON_LIMIT = 151;

export const BATCH_SIZE = 20; // Cantidad de Pokémon a cargar por batch

export const INITIAL_LOAD = 151; // Pokémon a cargar inicialmente
