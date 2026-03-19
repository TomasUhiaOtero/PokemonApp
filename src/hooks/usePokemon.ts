import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import type { Pokemon, PokemonType } from '../lib/types';

export { usePokemonOptimized, useInfiniteScroll } from './usePokemonOptimized';
export { pokemonApi, pokemonCache } from '../services/pokemonApi';

export function usePokemonFilter(pokemons: Pokemon[]) {
  const [activeTypes, setActiveTypes] = useState<PokemonType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredPokemons = useMemo(() => {
    let filtered = [...pokemons];

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
  }, [activeTypes, deferredQuery, pokemons]);

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

  const handleSearchChange = useCallback((query: string) => {
    const sanitized = query.replace(/[^a-zA-Z0-9\-\s]/g, '').slice(0, 50);
    setSearchQuery(sanitized);
  }, []);

  return {
    activeTypes,
    searchQuery,
    filteredPokemons,
    handleTypeToggle,
    handleSearchChange,
  };
}
