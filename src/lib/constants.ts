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

export const GENERATIONS = [
  { id: 1, name: 'Generation I', region: 'Kanto' },
  { id: 2, name: 'Generation II', region: 'Johto' },
  { id: 3, name: 'Generation III', region: 'Hoenn' },
  { id: 4, name: 'Generation IV', region: 'Sinnoh' },
  { id: 5, name: 'Generation V', region: 'Unova' },
  { id: 6, name: 'Generation VI', region: 'Kalos' },
  { id: 7, name: 'Generation VII', region: 'Alola' },
  { id: 8, name: 'Generation VIII', region: 'Galar' },
  { id: 9, name: 'Generation IX', region: 'Paldea' },
] as const;

export const DEFAULT_GENERATION = 1;

export const BATCH_SIZE = 20; // Cantidad de Pokémon a cargar por batch
