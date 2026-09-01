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

export const FORM_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  mega: { label: 'Mega', color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
  'mega-x': { label: 'Mega X', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
  'mega-y': { label: 'Mega Y', color: '#a855f7', bg: 'rgba(168,85,247,0.2)' },
  alola: { label: 'Alolan', color: '#06b6d4', bg: 'rgba(6,182,212,0.2)' },
  galar: { label: 'Galarian', color: '#8b5cf6', bg: 'rgba(139,92,246,0.2)' },
  hisui: { label: 'Hisuian', color: '#eab308', bg: 'rgba(234,179,8,0.2)' },
  paldea: { label: 'Paldean', color: '#22c55e', bg: 'rgba(34,197,94,0.2)' },
  gmax: { label: 'G-Max', color: '#f97316', bg: 'rgba(249,115,22,0.2)' },
  eternamax: { label: 'E-Max', color: '#dc2626', bg: 'rgba(220,38,38,0.2)' },
  totem: { label: 'Totem', color: '#ec4899', bg: 'rgba(236,72,153,0.2)' },
  bloodmoon: { label: 'Bloodmoon', color: '#991b1b', bg: 'rgba(153,27,27,0.2)' },
  default: { label: 'Form', color: '#6b7280', bg: 'rgba(107,114,128,0.2)' },
};
