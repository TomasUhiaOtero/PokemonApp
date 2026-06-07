import { useState, useMemo, useCallback, useDeferredValue, useEffect, useRef } from 'react';
import type { Pokemon, PokemonType } from '../lib/types';
import { pokemonApi } from '../services/pokemonApi';

export { usePokemonOptimized, useInfiniteScroll } from './usePokemonOptimized';
export { useFavorites } from './useFavorites';
export { pokemonApi, pokemonCache } from '../services/pokemonApi';

interface UsePokemonFilterProps {
  pokemons: Pokemon[];
  favoriteIds?: Set<number>;
  allPokemonNames: Array<{ id: number; name: string }>;
}

export function usePokemonFilter({ pokemons, favoriteIds = new Set(), allPokemonNames }: UsePokemonFilterProps) {
  const [activeTypes, setActiveTypes] = useState<PokemonType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!deferredQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    setIsSearching(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const query = deferredQuery.toLowerCase().trim();
    const matches = allPokemonNames
      .filter((p) => p.name.includes(query))
      .slice(0, 50);

    if (matches.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controllerSignal = controller.signal;

    pokemonApi.getPokemonBatch(matches.map((m) => m.id))
      .then((results) => {
        if (controllerSignal.aborted) return;
        setSearchResults(results);
        setIsSearching(false);
      })
      .catch(() => {
        if (controllerSignal.aborted) return;
        setIsSearching(false);
      });
  }, [deferredQuery, allPokemonNames]);

  const filteredPokemons = useMemo(() => {
    if (deferredQuery) {
      let filtered = [...searchResults];
      if (showFavoritesOnly) {
        filtered = filtered.filter((p) => favoriteIds.has(p.id));
      }
      if (activeTypes.length > 0) {
        filtered = filtered.filter((p) =>
          activeTypes.every((type) => p.types.includes(type))
        );
      }
      return filtered;
    }

    let filtered = [...pokemons];
    if (showFavoritesOnly) {
      filtered = filtered.filter((p) => favoriteIds.has(p.id));
    }
    if (deferredQuery || searchResults.length > 0) {
      // fall through — handled above
    }
    if (deferredQuery) {
      const sanitized = deferredQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(sanitized));
    }
    if (activeTypes.length > 0) {
      filtered = filtered.filter((p) =>
        activeTypes.every((type) => p.types.includes(type))
      );
    }
    return filtered;
  }, [activeTypes, deferredQuery, searchResults, pokemons, showFavoritesOnly, favoriteIds]);

  const handleTypeToggle = useCallback((type: PokemonType) => {
    if (type === 'all') {
      setActiveTypes([]);
      return;
    }
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleFavoritesToggle = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    const sanitized = query.replace(/[^a-zA-Z0-9\-\s]/g, '').slice(0, 50);
    setSearchQuery(sanitized);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveTypes([]);
    setShowFavoritesOnly(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    activeTypes,
    searchQuery,
    showFavoritesOnly,
    filteredPokemons,
    isSearching,
    handleTypeToggle,
    handleFavoritesToggle,
    handleSearchChange,
    resetFilters,
  };
}
