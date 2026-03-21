/**
 * Hook para gestionar favoritos de Pokemon
 * - Persistencia en localStorage
 * - Toggle add/remove
 * - Check si es favorito
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pokemon_favorites';

function loadFromStorage(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (e) {
    console.warn('Error loading favorites from localStorage:', e);
  }
  return new Set();
}

function saveToStorage(ids: Set<number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch (e) {
    console.warn('Error saving favorites to localStorage:', e);
  }
}

interface UseFavoritesReturn {
  favoriteIds: Set<number>;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  favoriteCount: number;
  clearFavorites: () => void;
}

export function useFavorites(): UseFavoritesReturn {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => loadFromStorage());

  // Persistir cambios en localStorage
  useEffect(() => {
    saveToStorage(favoriteIds);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((id: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number): boolean => {
    return favoriteIds.has(id);
  }, [favoriteIds]);

  const clearFavorites = useCallback(() => {
    setFavoriteIds(new Set());
  }, []);

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    favoriteCount: favoriteIds.size,
    clearFavorites,
  };
}
