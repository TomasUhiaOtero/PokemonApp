import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokemon, PokemonType } from '../lib/types';
import { API_BASE_URL, POKEMON_LIMIT } from '../lib/constants';

export function usePokemon() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const pokemonData: Pokemon[] = [];
        
        for (let i = 1; i <= POKEMON_LIMIT; i++) {
          try {
            const response = await fetch(`${API_BASE_URL}/pokemon/${i}`);
            if (!response.ok) {
              continue;
            }
            const data = await response.json();
            pokemonData.push({
              id: data.id,
              name: data.name,
              types: data.types.map((t: { type: { name: string } }) => t.type.name),
              number: data.id,
            });
          } catch (err) {
            console.error(`Error fetching pokemon ${i}:`, err);
          }
        }
        
        setPokemons(pokemonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  return { pokemons, isLoading, error };
}

export function usePokemonFilter(pokemons: Pokemon[]) {
  const [activeType, setActiveType] = useState<PokemonType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPokemons = useMemo(() => {
    let filtered = [...pokemons];

    if (activeType === 'all' && !searchQuery) {
      return filtered;
    }

    if (activeType !== 'all') {
      filtered = filtered.filter((p) => p.types.includes(activeType));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [activeType, searchQuery, pokemons]);

  const handleTypeChange = useCallback((type: PokemonType) => {
    setActiveType(type);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    activeType,
    searchQuery,
    filteredPokemons,
    handleTypeChange,
    handleSearchChange,
  };
}
