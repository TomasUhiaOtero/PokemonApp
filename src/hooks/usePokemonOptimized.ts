/**
 * Hook optimizado para cargar Pokémon con:
 * - Carga en 2 fases (metadata rápida + detalles progresivos)
 * - Caché inteligente
 * - Siempre muestra todas las páginas basándose en POKEMON_LIMIT
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Pokemon } from '../lib/types';
import { pokemonApi, pokemonCache } from '../services/pokemonApi';
import { POKEMON_LIMIT, BATCH_SIZE, INITIAL_LOAD } from '../lib/constants';

interface UsePokemonOptimizedReturn {
  pokemons: Pokemon[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalLoaded: number;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
  cacheStatus: {
    age: number | null;
    isCached: boolean;
  };
}

function deduplicateById(pokemons: Pokemon[]): Pokemon[] {
  return Array.from(
    new Map(pokemons.map((p) => [p.id, p])).values()
  );
}

export function usePokemonOptimized(): UsePokemonOptimizedReturn {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [totalCount, setTotalCount] = useState(POKEMON_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  
  const loadedIds = useRef<Set<number>>(new Set());
  const initialized = useRef(false);
  
  const cacheAge = useMemo(() => 
    pokemonCache.getCacheAge(`pokemon_1`), 
    [pokemons.length]
  );

  const loadBatch = useCallback(async (offset: number, count: number): Promise<Pokemon[]> => {
    try {
      const list = await pokemonApi.getPokemonList(count, offset);
      
      const ids = list.results
        .map((item) => {
          const parts = item.url.split('/');
          return parseInt(parts[parts.length - 2], 10);
        })
        .filter((id) => id >= 1 && id <= POKEMON_LIMIT);

      const newIds = ids.filter((id) => !loadedIds.current.has(id));
      
      if (newIds.length === 0) {
        return [];
      }

      const details = await pokemonApi.getPokemonBatch(newIds);
      details.forEach((p) => loadedIds.current.add(p.id));
      
      return details;
    } catch (err) {
      console.error('Error loading batch:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    
    const initMetadata = async () => {
      try {
        const count = await pokemonApi.getPokemonListMetadata();
        setTotalCount(count);
        setHasMore(count > 0);
      } catch (err) {
        console.error('Error loading metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metadata');
      }
    };

    initMetadata();
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const cachedPokemons: Pokemon[] = [];
        
        for (let i = 1; i <= POKEMON_LIMIT; i++) {
          const cached = pokemonCache.get<Pokemon>(`pokemon_${i}`);
          if (cached) {
            cachedPokemons.push(cached);
            loadedIds.current.add(i);
          }
        }

        if (cachedPokemons.length > 0) {
          const uniquePokemons = deduplicateById(cachedPokemons);
          setPokemons(uniquePokemons.sort((a, b) => a.id - b.id));
          setTotalLoaded(cachedPokemons.length);
          setIsLoading(false);
          
          if (cachedPokemons.length >= POKEMON_LIMIT) {
            setHasMore(false);
            return;
          }
        }

        const firstBatch = await loadBatch(0, INITIAL_LOAD);
        const allPokemons = [...cachedPokemons, ...firstBatch];
        const uniquePokemons = deduplicateById(allPokemons);
        
        setPokemons(uniquePokemons.sort((a, b) => a.id - b.id));
        setTotalLoaded(uniquePokemons.length);
        setHasMore(uniquePokemons.length < POKEMON_LIMIT);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pokemon');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadBatch]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || pokemons.length >= POKEMON_LIMIT) {
      return;
    }

    setIsLoadingMore(true);
    
    try {
      const nextBatch = await loadBatch(pokemons.length, BATCH_SIZE);
      
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setPokemons((prev) => {
          const combined = [...prev, ...nextBatch];
          const unique = deduplicateById(combined);
          return unique.sort((a, b) => a.id - b.id);
        });
        setTotalLoaded((prev) => prev + nextBatch.length);
        
        if (pokemons.length + nextBatch.length >= POKEMON_LIMIT) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, pokemons.length, loadBatch]);

  const refresh = useCallback(() => {
    pokemonCache.invalidate();
    loadedIds.current.clear();
    initialized.current = false;
    setPokemons([]);
    setTotalLoaded(0);
    setHasMore(true);
  }, []);

  return {
    pokemons,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalLoaded,
    totalCount,
    loadMore,
    refresh,
    cacheStatus: {
      age: cacheAge,
      isCached: cacheAge !== null,
    },
  };
}

export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastLoadPage = useRef<number>(0);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            const nextPage = lastLoadPage.current + 1;
            lastLoadPage.current = nextPage;
            loadMore();
          }
        },
        {
          rootMargin: '200px',
          threshold: 0,
        }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [loadMore, hasMore, isLoading]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}
