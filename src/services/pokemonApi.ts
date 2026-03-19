/**
 * Cliente API optimizado para PokéAPI
 * Incluye: caché, retry con exponential backoff, rate limiting, y manejo de errores
 */

import type { Pokemon } from '../lib/types';
import { API_BASE_URL, POKEMON_LIMIT, BATCH_SIZE } from '../lib/constants';

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

// ============================================================================
// Constantes de Configuración
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const STORAGE_KEY = 'pokemon_cache';

// ============================================================================
// Sistema de Caché con localStorage
// ============================================================================

class PokemonCache {
  private memoryCache = new Map<string, CachedData<unknown>>();

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
   * Obtener solo el total de Pokémon (metadata)
   * Muy rápido, solo para saber cuántas páginas mostrar
   * Limita automáticamente a POKEMON_LIMIT (primera generación)
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
    
    const count = Math.min(data.count, POKEMON_LIMIT);
    pokemonCache.set(cacheKey, { count });
    return count;
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

  /**
   * Limpiar Pokémon que no son de primera generación (>151)
   * Útil para corregir caché contaminado
   */
  cleanOldGenerationsCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(`${STORAGE_KEY}_pokemon_`)) {
          // Extraer el ID del Pokémon del key
          const match = k.match(/pokemon_(\d+)/);
          if (match) {
            const id = parseInt(match[1], 10);
            if (id > POKEMON_LIMIT) {
              keysToRemove.push(k);
            }
          }
        }
      }
      keysToRemove.forEach((k) => {
        localStorage.removeItem(k);
        pokemonCache.invalidate(k.replace(`${STORAGE_KEY}_`, ''));
      });
      console.log(`🧹 [API] Limpiados ${keysToRemove.length} Pokémon de generaciones antiguas`);
    } catch (error) {
      console.warn('Error cleaning old generations cache:', error);
    }
  }
}

export const pokemonApi = new PokemonAPIClient();
