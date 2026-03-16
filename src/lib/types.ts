export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  number: number;
}

export interface PokemonBasic {
  name: string;
  number: number;
  types: string[];
}

export type PokemonType = 
  | 'all'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'psychic'
  | 'ice'
  | 'dragon'
  | 'dark'
  | 'fairy'
  | 'normal'
  | 'bug'
  | 'fighting'
  | 'flying'
  | 'ground'
  | 'rock'
  | 'steel'
  | 'poison'
  | 'ghost';
