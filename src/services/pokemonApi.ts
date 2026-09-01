/**
 * Cliente API optimizado para PokéAPI
 * Incluye: caché, retry con exponential backoff, rate limiting, y manejo de errores
 */

import type { Pokemon, PokemonDetail, PokemonStat, PokemonAbility, EvolutionStage, VarietyInfo } from '../lib/types';
import { API_BASE_URL, BATCH_SIZE } from '../lib/constants';

// ============================================================================
// Tipos y Utilidades
// ============================================================================

interface CachedData<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

interface PokemonDetailResponse {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
}

interface PokemonFullResponse {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
  cries: {
    latest: string;
    legacy: string;
  };
}

interface VarietyEntry {
  is_default: boolean;
  pokemon: { name: string; url: string };
}

interface PokemonSpeciesResponse {
  id: number;
  name: string;
  generation: { name: string; url: string };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  evolution_chain: { url: string };
  varieties: VarietyEntry[];
}

interface GenerationResponse {
  id: number;
  name: string;
  pokemon_species: Array<{ name: string; url: string }>;
}

interface EvolutionChainResponse {
  chain: EvolutionNode;
}

interface EvolutionNode {
  species: { name: string; url: string };
  evolution_details: Array<{
    min_level: number | null;
    trigger: { name: string };
    item: { name: string } | null;
  }>;
  evolves_to: EvolutionNode[];
}

// ============================================================================
// Constantes de Configuración
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const STORAGE_KEY = 'pokemon_cache_v2'; // Version bump para invalidar caché antigua

// ============================================================================
// Sistema de Caché con localStorage
// ============================================================================

class PokemonCache {
  private memoryCache = new Map<string, CachedData<unknown>>();

  constructor() {
    // Limpiar entradas de caché antigua (sin versión)
    this.cleanOldCache();
  }

  private cleanOldCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        // Remover entradas sin versión en el key
        if (k?.startsWith('pokemon_cache_') && !k.startsWith(STORAGE_KEY)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      if (keysToRemove.length > 0) {
        console.log(`🧹 [Cache] Limpiadas ${keysToRemove.length} entradas de caché antigua`);
      }
    } catch (error) {
      // Ignore silently
    }
  }

  get<T>(key: string): T | null {
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < CACHE_DURATION) {
      return memoryData.data as T;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (stored) {
        const parsed: CachedData<T> = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }

    return null;
  }

  set<T>(key: string, data: T): void {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };

    this.memoryCache.set(key, cacheData);

    try {
      localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }

  invalidate(key?: string): void {
    if (key) {
      this.memoryCache.delete(key);
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
    } else {
      this.memoryCache.clear();
      // Limpiar solo nuestras entradas del localStorage
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(STORAGE_KEY)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (error) {
        console.warn('Error clearing cache:', error);
      }
    }
  }

  getCacheAge(key: string): number | null {
    const memoryData = this.memoryCache.get(key);
    if (memoryData) {
      return Date.now() - memoryData.timestamp;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      if (stored) {
        const parsed: CachedData<unknown> = JSON.parse(stored);
        return Date.now() - parsed.timestamp;
      }
    } catch (error) {
      // Ignore
    }

    return null;
  }
}

export const pokemonCache = new PokemonCache();

// ============================================================================
// Retry con Exponential Backoff
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        if (!response.ok) {
          // No retry para errores 4xx (excepto 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = retryDelay * Math.pow(2, attempt);
          // Añadir jitter para evitar thundering herd
          const jitter = Math.random() * 500;
          await sleep(delay + jitter);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Cliente API Principal
// ============================================================================

class PokemonAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtener la lista de Pokémon con paginación
   * Usa el endpoint optimizado que solo devuelve nombres y URLs
   */
  async getPokemonList(
    limit: number = BATCH_SIZE,
    offset: number = 0
  ): Promise<PokemonListResponse> {
    const validLimit = Math.max(1, Math.min(Number(limit) || BATCH_SIZE, 1000));
    const validOffset = Math.max(0, Number(offset) || 0);
    
    const cacheKey = `list_${validLimit}_${validOffset}`;
    
    const cached = pokemonCache.get<PokemonListResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await fetchWithRetry<PokemonListResponse>(
      `${this.baseUrl}/pokemon?limit=${validLimit}&offset=${validOffset}`,
      { retries: 3 }
    );

    pokemonCache.set(cacheKey, data);
    return data;
  }

  /**
   * Obtener el total de Pokémon registrados en PokeAPI
   */
  async getPokemonListMetadata(): Promise<number> {
    const cacheKey = 'list_metadata_count';
    
    const cached = pokemonCache.get<{ count: number }>(cacheKey);
    if (cached) {
      return cached.count;
    }

    const data = await fetchWithRetry<PokemonListResponse>(
      `${this.baseUrl}/pokemon?limit=1&offset=0`,
      { retries: 3 }
    );
    
    pokemonCache.set(cacheKey, { count: data.count });
    return data.count;
  }

  /**
   * Obtener todos los Pokémon básicos (id, name) para búsqueda global
   */
  async getAllPokemonBasic(): Promise<Array<{ id: number; name: string }>> {
    const cacheKey = 'all_pokemon_basic';
    
    const cached = pokemonCache.get<Array<{ id: number; name: string }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.getPokemonList(2000, 0);
    const result = data.results
      .map((item) => {
        const parts = item.url.split('/');
        const id = parseInt(parts[parts.length - 2], 10);
        return { id, name: item.name };
      })
      .filter((item) => !isNaN(item.id) && item.id > 0);

    pokemonCache.set(cacheKey, result);
    return result;
  }

  /**
   * Obtener la lista de species IDs para una generación
   * Usa el endpoint /generation/{id} de PokeAPI
   */
  async getGenerationSpecies(generationId: number): Promise<number[]> {
    if (!generationId || generationId < 1) {
      throw new Error('Invalid generation ID');
    }

    const cacheKey = `generation_${generationId}_species`;
    
    const cached = pokemonCache.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await fetchWithRetry<GenerationResponse>(
      `${this.baseUrl}/generation/${generationId}`,
      { retries: 3 }
    );

    const ids = data.pokemon_species
      .map((species) => {
        const parts = species.url.split('/');
        return parseInt(parts[parts.length - 2], 10);
      })
      .filter((id) => !isNaN(id) && id > 0);

    pokemonCache.set(cacheKey, ids);
    return ids;
  }

  /**
   * Obtener todos los Pokémon de una generación específica
   */
  async getPokemonByGeneration(generationId: number): Promise<Pokemon[]> {
    const ids = await this.getGenerationSpecies(generationId);
    return this.getPokemonBatch(ids);
  }

  /**
   * Obtener las variedades (formas) de una especie
   */
  async getSpeciesVarieties(speciesId: number): Promise<VarietyInfo[]> {
    const cacheKey = `species_${speciesId}_varieties`;

    const cached = pokemonCache.get<VarietyInfo[]>(cacheKey);
    if (cached) return cached;

    const data = await fetchWithRetry<PokemonSpeciesResponse>(
      `${this.baseUrl}/pokemon-species/${speciesId}`,
      { retries: 2 }
    );

    const varieties: VarietyInfo[] = [];

    if (data.varieties) {
      for (const v of data.varieties) {
        if (v.is_default) continue;

        const parts = v.pokemon.url.split('/');
        const id = parseInt(parts[parts.length - 2], 10);
        if (isNaN(id) || id < 1) continue;

        const formName = this.formatFormName(v.pokemon.name, data.name);
        if (!formName) continue;

        varieties.push({ id, name: v.pokemon.name, formName });
      }
    }

    pokemonCache.set(cacheKey, varieties);
    return varieties;
  }

  /**
   * Obtener todas las variedades (formas) para una lista de species IDs
   */
  async getVarietiesForSpeciesList(speciesIds: number[]): Promise<VarietyInfo[]> {
    const promises = speciesIds.map(id =>
      this.getSpeciesVarieties(id).catch(() => [] as VarietyInfo[])
    );
    const results = await this.fetchWithConcurrency(promises, 10);
    return results.flat();
  }

  /**
   * Obtener datos básicos para variedades (con formName incluido)
   */
  async getVarietyPokemonBatch(varieties: VarietyInfo[]): Promise<Pokemon[]> {
    const ids = varieties.map(v => v.id);
    const pokemons = await this.getPokemonBatch(ids);

    const varietyMap = new Map(varieties.map(v => [v.id, v.formName]));

    return pokemons.map(p => ({
      ...p,
      formName: varietyMap.get(p.id),
    }));
  }

  /**
   * Obtener detalles de un Pokémon específico
   */
  async getPokemonDetail(idOrName: number | string): Promise<Pokemon> {
    if (!idOrName || (typeof idOrName === 'number' && idOrName < 1)) {
      throw new Error('Invalid Pokemon ID or name');
    }

    const sanitizedIdOrName = typeof idOrName === 'string' 
      ? idOrName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
      : idOrName;

    const cacheKey = `pokemon_${sanitizedIdOrName}`;
    
    const cached = pokemonCache.get<Pokemon>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await fetchWithRetry<PokemonDetailResponse>(
      `${this.baseUrl}/pokemon/${sanitizedIdOrName}`
    );

    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types: data.types.map((t) => t.type.name),
      number: data.id,
    };

    pokemonCache.set(cacheKey, pokemon);
    return pokemon;
  }

  /**
   * Obtener múltiples Pokémon por IDs (batch)
   */
  async getPokemonBatch(ids: number[]): Promise<Pokemon[]> {
    const uncachedIds: number[] = [];
    const results: Pokemon[] = [];

    // Primero verificar cuáles están en caché
    for (const id of ids) {
      const cached = pokemonCache.get<Pokemon>(`pokemon_${id}`);
      if (cached) {
        results.push(cached);
      } else {
        uncachedIds.push(id);
      }
    }

    console.log(`📦 [API] Batch: ${results.length} del caché, ${uncachedIds.length} a fetchear`);

    // Fetchear los que no están en caché en paralelo con límite
    if (uncachedIds.length > 0) {
      const batchPromises = uncachedIds.map((id) =>
        this.getPokemonDetail(id).catch((error) => {
          console.error(`Error fetching Pokémon ${id}:`, error);
          return null;
        })
      );

      // Limitar concurrencia a 10 requests simultáneas
      const batchResults = await this.fetchWithConcurrency(batchPromises, 10);
      results.push(...batchResults.filter((p): p is Pokemon => p !== null));
    }

    // Ordenar por ID
    return results.sort((a, b) => a.id - b.id);
  }

  /**
   * Obtener datos completos de un Pokémon (stats, abilities, evolución, etc.)
   */
  async getPokemonDetailFull(id: number): Promise<PokemonDetail> {
    if (!id || id < 1) {
      throw new Error('Invalid Pokemon ID');
    }

    const cacheKey = `pokemon_full_${id}`;
    
    const cached = pokemonCache.get<PokemonDetail>(cacheKey);
    if (cached) {
      return cached;
    }

    const pokemonData = await fetchWithRetry<PokemonFullResponse>(
      `${this.baseUrl}/pokemon/${id}`
    );

    let speciesData: PokemonSpeciesResponse | null = null;
    try {
      speciesData = await fetchWithRetry<PokemonSpeciesResponse>(
        `${this.baseUrl}/pokemon-species/${id}`,
        { retries: 1 }
      );
    } catch {
      // Form Pokémon (megas, regionales, etc.) no tienen /pokemon-species propio
    }

    let evolutionChain: EvolutionStage[] = [];
    if (speciesData?.evolution_chain?.url) {
      try {
        evolutionChain = await this.getEvolutionChain(speciesData.evolution_chain.url);
      } catch {
        evolutionChain = [];
      }
    }

    const stats: PokemonStat[] = pokemonData.stats.map((stat) => ({
      name: this.formatStatName(stat.stat.name),
      value: stat.base_stat,
      maxValue: 255,
    }));

    const abilities: PokemonAbility[] = pokemonData.abilities.map((ability) => ({
      name: this.formatAbilityName(ability.ability.name),
      isHidden: ability.is_hidden,
    }));

    const description = speciesData?.flavor_text_entries?.find(
      (entry) => entry.language.name === 'en'
    )?.flavor_text.replace(/\f/g, ' ') || '';

    const generationNumber = speciesData?.generation?.name
      ? parseInt(speciesData.generation.name.replace('generation-', ''), 10)
      : 0;

    const detail: PokemonDetail = {
      id: pokemonData.id,
      name: pokemonData.name,
      types: pokemonData.types.map((t) => t.type.name),
      number: pokemonData.id,
      stats,
      abilities,
      height: pokemonData.height / 10,
      weight: pokemonData.weight / 10,
      description,
      generation: generationNumber,
      generationName: speciesData?.generation?.name || 'unknown',
      evolutionChain,
      cryUrl: pokemonData.cries?.latest,
    };

    pokemonCache.set(cacheKey, detail);
    return detail;
  }

  /**
   * Obtener cadena de evolución
   */
  private async getEvolutionChain(url: string): Promise<EvolutionStage[]> {
    const chainData = await fetchWithRetry<EvolutionChainResponse>(url);
    const stages: EvolutionStage[] = [];

    const extractStages = (node: EvolutionNode) => {
      const speciesUrl = node.species.url;
      const idMatch = speciesUrl.match(/\/pokemon-species\/(\d+)\/?$/);
      const id = idMatch ? parseInt(idMatch[1], 10) : 0;

      let evolutionLevel: string | undefined;
      let evolutionCondition: string | undefined;

      if (node.evolution_details.length > 0) {
        const detail = node.evolution_details[0];

        if (detail.min_level !== null) {
          evolutionLevel = `Level ${detail.min_level}`;
        } else if (detail.item) {
          evolutionCondition = this.formatItemName(detail.item.name);
        } else {
          evolutionCondition = this.formatTriggerName(detail.trigger.name);
        }
      }

      stages.push({
        id,
        name: node.species.name,
        types: [],
        evolutionLevel,
        evolutionCondition,
      });

      node.evolves_to.forEach(extractStages);
    };

    extractStages(chainData.chain);

    for (let i = 0; i < stages.length; i++) {
      try {
        const pokemonData = await fetchWithRetry<{ types: Array<{ type: { name: string } }> }>(
          `${this.baseUrl}/pokemon/${stages[i].id}`
        );
        stages[i].types = pokemonData.types.map((t) => t.type.name);
      } catch {
        stages[i].types = [];
      }
    }

    return stages;
  }

  /**
   * Formatear nombre de stat para mostrar
   */
  private formatStatName(name: string): string {
    const statNames: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp.Atk',
      'special-defense': 'Sp.Def',
      'speed': 'Speed',
    };
    return statNames[name] || name;
  }

  /**
   * Formatear nombre de habilidad
   */
  private formatAbilityName(name: string): string {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /**
   * Formatear nombre de item para evolución
   */
  private formatItemName(name: string): string {
    const itemNames: Record<string, string> = {
      'fire-stone': 'Fire Stone',
      'water-stone': 'Water Stone',
      'thunder-stone': 'Thunder Stone',
      'leaf-stone': 'Leaf Stone',
      'moon-stone': 'Moon Stone',
      'sun-stone': 'Sun Stone',
      'shiny-stone': 'Shiny Stone',
      'dusk-stone': 'Dusk Stone',
      'dawn-stone': 'Dawn Stone',
      'ice-stone': 'Ice Stone',
    };
    return itemNames[name] || name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /**
   * Extraer el nombre de forma a partir del nombre PokeAPI
   * 'charizard-mega-x' → 'Mega X', 'raichu-alola' → 'Alolan'
   */
  private formatFormName(name: string, baseName: string): string {
    const withoutBase = name.replace(baseName, '');
    if (!withoutBase) return 'Default';

    const clean = withoutBase.replace(/^-/, '');

    const knownForms: Record<string, string> = {
      'mega': 'Mega',
      'mega-x': 'Mega X',
      'mega-y': 'Mega Y',
      'alola': 'Alolan',
      'galar': 'Galarian',
      'galarian': 'Galarian',
      'hisui': 'Hisuian',
      'hisuian': 'Hisuian',
      'paldea': 'Paldean',
      'paldean': 'Paldean',
      'gmax': 'G-Max',
      'gigantamax': 'G-Max',
      'eternamax': 'E-Max',
      'totem': 'Totem',
      'bloodmoon': 'Bloodmoon',
    };

    if (knownForms[clean]) return knownForms[clean];

    const namesToSkip = ['normal', 'standard', 'ordinary', 'land', 'average', 'fifty', 'red-striped', 'blue-striped'];
    if (namesToSkip.includes(clean)) return '';

    return clean.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Formatear nombre de trigger de evolución
   */
  private formatTriggerName(name: string): string {
    const triggerNames: Record<string, string> = {
      'level-up': 'Level up',
      'trade': 'Trade',
      'use-item': 'Use item',
      'shed': 'Shed',
    };
    return triggerNames[name] || name;
  }

  /**
   * Fetch con límite de concurrencia
   * Mantiene el orden original de las promesas
   */
  private async fetchWithConcurrency<T>(
    promises: Promise<T>[],
    limit: number
  ): Promise<T[]> {
    const results: (T | undefined)[] = new Array(promises.length);
    const executing: { promise: Promise<void>; index: number }[] = [];

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];
      
      const p = promise.then((result) => {
        results[i] = result;
      });

      executing.push({ promise: p, index: i });

      if (executing.length >= limit) {
        const oldest = executing.shift()!;
        await oldest.promise;
      }
    }

    await Promise.all(executing.map(e => e.promise));
    return results.filter((r): r is T => r !== undefined);
  }

  /**
   * Invalidar toda la caché
   */
  clearCache(): void {
    pokemonCache.invalidate();
  }

}

export const pokemonApi = new PokemonAPIClient();
