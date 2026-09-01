export interface Generation {
  id: number;
  name: string;
  region: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  number: number;
  formName?: string;
}

export interface VarietyInfo {
  id: number;
  name: string;
  formName: string;
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

export interface PokemonStat {
  name: string;
  value: number;
  maxValue: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface EvolutionStage {
  id: number;
  name: string;
  types: string[];
  evolutionLevel?: string;
  evolutionCondition?: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: string[];
  number: number;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  height: number;
  weight: number;
  description: string;
  generation: number;
  generationName: string;
  evolutionChain: EvolutionStage[];
  cryUrl?: string;
  formName?: string;
}
