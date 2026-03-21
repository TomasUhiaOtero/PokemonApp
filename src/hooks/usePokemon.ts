import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import type { Pokemon, PokemonType } from '../lib/types';

export { usePokemonOptimized, useInfiniteScroll } from './usePokemonOptimized';
export { useFavorites } from './useFavorites';
export { pokemonApi, pokemonCache } from '../services/pokemonApi';

interface UsePokemonFilterProps {
  pokemons: Pokemon[];
  favoriteIds?: Set<number>;
}

export function usePokemonFilter({ pokemons, favoriteIds = new Set() }: UsePokemonFilterProps) {
  const [activeTypes, setActiveTypes] = useState<PokemonType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredPokemons = useMemo(() => {
    let filtered = [...pokemons];

    // Filtro de favoritos primero
    if (showFavoritesOnly) {
      filtered = filtered.filter((p) => favoriteIds.has(p.id));
    }

    if (deferredQuery) {
      const sanitized = deferredQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(sanitized));
    }

    if (activeTypes.length > 0) {
      filtered = filtered.filter((p) => 
        activeTypes.every(type => p.types.includes(type))
      );
    }

    return filtered;
  }, [activeTypes, deferredQuery, pokemons, showFavoritesOnly, favoriteIds]);

  const handleTypeToggle = useCallback((type: PokemonType) => {
    if (type === 'all') {
      setActiveTypes([]);
      return;
    }
    
    setActiveTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleFavoritesToggle = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    const sanitized = query.replace(/[^a-zA-Z0-9\-\s]/g, '').slice(0, 50);
    setSearchQuery(sanitized);
  }, []);

  // Reset page when filters change
  const resetFilters = useCallback(() => {
    setActiveTypes([]);
    setShowFavoritesOnly(false);
    setSearchQuery('');
  }, []);

  return {
    activeTypes,
    searchQuery,
    showFavoritesOnly,
    filteredPokemons,
    handleTypeToggle,
    handleFavoritesToggle,
    handleSearchChange,
    resetFilters,
  };
}
