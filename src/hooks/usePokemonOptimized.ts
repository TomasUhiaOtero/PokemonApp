import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Pokemon } from '../lib/types';
import { pokemonApi, pokemonCache } from '../services/pokemonApi';
import { BATCH_SIZE } from '../lib/constants';

interface UsePokemonOptimizedProps {
  generation: number;
}

interface UsePokemonOptimizedReturn {
  pokemons: Pokemon[];
  isLoading: boolean;
  isSwitchingGeneration: boolean;
  isLoadingMore: boolean;
  isLoadingForms: boolean;
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
  allPokemonNames: Array<{ id: number; name: string }>;
}

function deduplicateById(pokemons: Pokemon[]): Pokemon[] {
  return Array.from(
    new Map(pokemons.map((p) => [p.id, p])).values()
  );
}

export function usePokemonOptimized({ generation }: UsePokemonOptimizedProps): UsePokemonOptimizedReturn {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingGeneration, setIsSwitchingGeneration] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allPokemonNames, setAllPokemonNames] = useState<Array<{ id: number; name: string }>>([]);

  const speciesIdsRef = useRef<number[]>([]);
  const loadedIdsRef = useRef<Set<number>>(new Set());
  const isInitialLoadRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const cacheAge = useMemo(() =>
    pokemonCache.getCacheAge(`generation_${generation}_species`),
    [generation, pokemons.length]
  );

  // Cargar lista global de nombres al montar
  useEffect(() => {
    if (allPokemonNames.length > 0) return;
    pokemonApi.getAllPokemonBasic().then(setAllPokemonNames);
  }, []);

  // Resetear cuando cambia la generación
  useEffect(() => {
    setIsSwitchingGeneration(true);
    speciesIdsRef.current = [];
    loadedIdsRef.current.clear();
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setTotalLoaded(0);
    setHasMore(true);
    setError(null);
  }, [generation]);

  // Cargar los Pokémon de la generación seleccionada (base + formas)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;

    const loadGeneration = async () => {
      setIsLoading(true);
      setIsLoadingForms(true);

      try {
        const ids = await pokemonApi.getGenerationSpecies(generation);

        if (cancelled) return;

        speciesIdsRef.current = ids;

        const cachedPokemons: Pokemon[] = [];
        for (const id of ids) {
          const cached = pokemonCache.get<Pokemon>(`pokemon_${id}`);
          if (cached) {
            cachedPokemons.push(cached);
            loadedIdsRef.current.add(id);
          }
        }

        if (cancelled) return;

        const missingIds = ids.filter((id) => !loadedIdsRef.current.has(id));

        let basePokemons: Pokemon[] = [];
        if (missingIds.length > 0) {
          const freshPokemons = await pokemonApi.getPokemonBatch(missingIds);
          if (cancelled) return;
          basePokemons = deduplicateById([...cachedPokemons, ...freshPokemons]);
        } else {
          basePokemons = deduplicateById(cachedPokemons);
        }

        basePokemons.sort((a, b) => a.id - b.id);

        if (cancelled) return;

        // Cargar variedades (formas) en paralelo
        const [varieties] = await Promise.all([
          pokemonApi.getVarietiesForSpeciesList(ids),
        ]);

        if (cancelled) return;

        let varietyPokemons: Pokemon[] = [];
        if (varieties.length > 0) {
          // Primero ver cuáles ya están en caché
          const cachedVarieties: Pokemon[] = [];
          const uncachedVarieties: typeof varieties = [];

          for (const v of varieties) {
            const cached = pokemonCache.get<Pokemon>(`pokemon_${v.id}`);
            if (cached) {
              cachedVarieties.push({ ...cached, formName: v.formName });
            } else {
              uncachedVarieties.push(v);
            }
          }

          if (uncachedVarieties.length > 0) {
            try {
              const freshVarieties = await pokemonApi.getVarietyPokemonBatch(uncachedVarieties);
              if (cancelled) return;
              varietyPokemons = [...cachedVarieties, ...freshVarieties].sort((a, b) => a.id - b.id);
            } catch {
              varietyPokemons = cachedVarieties;
            }
          } else {
            varietyPokemons = cachedVarieties.sort((a, b) => a.id - b.id);
          }
        }

        if (cancelled) return;

        const allPokemons = [...basePokemons, ...varietyPokemons]
          .sort((a, b) => a.id - b.id);

        setPokemons(allPokemons);
        setTotalCount(ids.length + varieties.length);
        setTotalLoaded(allPokemons.length);
        setHasMore(false);

        isInitialLoadRef.current = false;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load Pokemon');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingForms(false);
          setIsSwitchingGeneration(false);
        }
      }
    };

    loadGeneration();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [generation]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const allIds = speciesIdsRef.current;
      const nextIds = allIds.filter((id) => !loadedIdsRef.current.has(id));

      if (nextIds.length === 0) {
        setHasMore(false);
        return;
      }

      const batchIds = nextIds.slice(0, BATCH_SIZE);
      const batchPokemons = await pokemonApi.getPokemonBatch(batchIds);

      batchPokemons.forEach((p) => loadedIdsRef.current.add(p.id));

      setPokemons((prev) => {
        const combined = deduplicateById([...prev, ...batchPokemons]);
        return combined.sort((a, b) => a.id - b.id);
      });
      setTotalLoaded((prev) => prev + batchPokemons.length);

      if (loadedIdsRef.current.size >= allIds.length) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  const refresh = useCallback(() => {
    pokemonCache.invalidate();
    speciesIdsRef.current = [];
    loadedIdsRef.current.clear();
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setPokemons([]);
    setTotalLoaded(0);
    setHasMore(true);
    setIsLoading(true);
    setError(null);
  }, []);

  return {
    pokemons,
    isLoading,
    isSwitchingGeneration,
    isLoadingMore,
    isLoadingForms,
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
    allPokemonNames,
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
