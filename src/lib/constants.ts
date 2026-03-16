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
] as const;

export const API_BASE_URL = 'https://pokeapi.co/api/v2';

export const POKEMON_LIMIT = 151;
