import { useState, useCallback } from 'react';
import type { PokemonDetail } from '../lib/types';
import { pokemonApi } from '../services/pokemonApi';

interface UsePokemonDetailReturn {
  pokemonDetail: PokemonDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchPokemonDetail: (id: number, formName?: string) => Promise<void>;
  clearDetail: () => void;
}

export function usePokemonDetail(): UsePokemonDetailReturn {
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemonDetail = useCallback(async (id: number, formName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const detail = await pokemonApi.getPokemonDetailFull(id);
      setPokemonDetail(formName ? { ...detail, formName } : detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Pokemon details';
      setError(message);
      console.error('Error fetching Pokemon detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setPokemonDetail(null);
    setError(null);
  }, []);

  return {
    pokemonDetail,
    isLoading,
    error,
    fetchPokemonDetail,
    clearDetail,
  };
}
