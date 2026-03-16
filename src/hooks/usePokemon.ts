import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Pokemon, PokemonType } from '../lib/types';
import { API_BASE_URL, POKEMON_LIMIT } from '../lib/constants';

/**
 * Hook para obtener la lista de Pokemon desde la API
 * @returns {{ pokemons: Pokemon[], isLoading: boolean, error: string | null }}
 */
export function usePokemon() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const fetchPromises = Array.from(
          { length: POKEMON_LIMIT },
          (_, i) => fetch(`${API_BASE_URL}/pokemon/${i + 1}`).then((res) => {
            if (!res.ok) return null;
            return res.json();
          })
        );

        const results = await Promise.all(fetchPromises);
        
        const pokemonData: Pokemon[] = results
          .filter((data): data is NonNullable<typeof data> => data !== null)
          .map((data) => ({
            id: data.id,
            name: data.name,
            types: data.types.map((t: { type: { name: string } }) => t.type.name),
            number: data.id,
          }));
        
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

/**
 * Hook para filtrar Pokemon por tipo y búsqueda
 * @param {Pokemon[]} pokemons - Lista de Pokemon a filtrar
 * @returns {{ activeType: PokemonType, searchQuery: string, filteredPokemons: Pokemon[], handleTypeChange: (type: PokemonType) => void, handleSearchChange: (query: string) => void }}
 */
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
