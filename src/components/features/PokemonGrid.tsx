import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PokemonCard, TypeFilter, SearchInput } from '../ui';
import { PokemonDetailView } from '../ui/PokemonDetail';
import type { Pokemon, PokemonType, PokemonDetail } from '../../lib/types';
import { POKEMON_LIMIT } from '../../lib/constants';
import { usePokemonDetail } from '../../hooks/usePokemonDetail';

interface PokemonGridProps {
  pokemons: Pokemon[];
  activeTypes: PokemonType[];
  searchQuery: string;
  onTypeToggle: (type: PokemonType) => void;
  onSearchChange: (query: string) => void;
  // Favorites props
  showFavoritesOnly?: boolean;
  onFavoritesToggle?: () => void;
  favoriteCount?: number;
  isFavorite?: (id: number) => boolean;
  onToggleFavorite?: (id: number) => void;
  // Infinite scroll props
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalLoaded?: number;
  totalCount?: number;
}

// ============================================
// Pokedex-style Pagination
// 2 filas x 5 columnas = 10 Pokémon por página
// ============================================
const ITEMS_PER_PAGE = 10;

// ============================================
// Línea de navegación estilo Pokédex
// ============================================
function PokedexNavigation({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Barra de navegación compacta tipo Pokédex */}
      <div className="relative glass rounded-2xl p-3 border border-white/10">
        {/* Línea horizontal estilo Pokédex */}
        <div className="flex items-center gap-3">
          {/* Flechas */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-lg glass hover:bg-white/10 
                       disabled:opacity-30 disabled:cursor-not-allowed
                       flex items-center justify-center transition-all
                       border border-white/10 hover:border-white/20"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Indicador de posición actual */}
          <div className="flex items-center gap-1 min-w-[80px] justify-center">
            <span className="text-pokemon-yellow font-mono text-xl font-bold">
              {String(currentPage).padStart(2, '0')}
            </span>
            <span className="text-white/40 text-sm">/</span>
            <span className="text-white/60 font-mono text-sm">
              {String(totalPages).padStart(2, '0')}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden mx-2">
            <motion.div
              className="h-full bg-gradient-to-r from-pokemon-red via-pokemon-yellow to-pokemon-blue"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPage / totalPages) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Contador */}
          <span className="text-white/60 text-xs font-mono min-w-[70px] text-right">
            {String(startItem).padStart(3, '0')}-{String(endItem).padStart(3, '0')}
          </span>

          {/* Flecha siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-lg glass hover:bg-white/10 
                       disabled:opacity-30 disabled:cursor-not-allowed
                       flex items-center justify-center transition-all
                       border border-white/10 hover:border-white/20"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Indicadores de puntos compactos */}
        <div 
          className="flex justify-center mt-2 gap-2"
          role="tablist"
          aria-label="Pagination"
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              role="tab"
              tabIndex={currentPage === i + 1 ? 0 : -1}
              aria-selected={currentPage === i + 1}
              aria-label={`Page ${i + 1}`}
              onClick={() => onPageChange(i + 1)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer
                         ${
                           currentPage === i + 1
                             ? 'bg-pokemon-red w-5'
                             : 'bg-white/20 hover:bg-white/60 hover:w-3.5'
                         }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Componente principal
// ============================================
export function PokemonGrid({
  pokemons,
  activeTypes,
  searchQuery,
  onTypeToggle,
  onSearchChange,
  showFavoritesOnly = false,
  onFavoritesToggle,
  favoriteCount = 0,
  isFavorite,
  onToggleFavorite,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  totalLoaded = 0,
  totalCount = 0,
}: PokemonGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastLoadPage = useRef<number>(0);
  const scrollPositionRef = useRef<number>(0);
  
  const { 
    pokemonDetail, 
    isLoading: isLoadingDetail, 
    error: errorDetail, 
    fetchPokemonDetail, 
    clearDetail 
  } = usePokemonDetail();
  
  const totalPages = Math.ceil(pokemons.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pagePokemons = pokemons.slice(startIndex, endIndex);

  useEffect(() => {
    if (hasMore && 
        currentPage >= totalPages - 2 && 
        currentPage !== lastLoadPage.current &&
        onLoadMore) {
      lastLoadPage.current = currentPage;
      onLoadMore();
    }
  }, [currentPage, totalPages, hasMore, onLoadMore]);

  // Reset a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTypes, searchQuery, showFavoritesOnly]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage((p) => p + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Cambiar página SIN scroll - solo transición suave
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectPokemon = async (pokemon: Pokemon) => {
    // Guardar la posición de scroll antes de abrir el modal
    scrollPositionRef.current = window.scrollY;
    // Bloquear scroll mientras el modal está abierto
    document.body.style.overflow = 'hidden';
    await fetchPokemonDetail(pokemon.id);
  };

  const handleCloseDetail = useCallback(() => {
    clearDetail();
    // Restaurar scroll después de cerrar el modal
    requestAnimationFrame(() => {
      document.body.style.overflow = '';
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'instant'
      });
    });
  }, [clearDetail]);

  const handleBackToGrid = () => {
    clearDetail();
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {pokemonDetail && (
          <PokemonDetailView
            key="pokemon-detail"
            pokemon={pokemonDetail}
            onClose={handleCloseDetail}
            onBack={handleBackToGrid}
          />
        )}
      </AnimatePresence>

      {!pokemonDetail && (
    <section id="pokemons" className="py-20 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet the Pokemon
          </h2>
          <p className="text-white/60 text-lg">
            Browse through the complete collection
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10"
        >
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <TypeFilter 
            activeTypes={activeTypes} 
            onTypeToggle={onTypeToggle}
            showFavoritesOnly={showFavoritesOnly}
            onFavoritesToggle={onFavoritesToggle}
            favoriteCount={favoriteCount}
          />
        </motion.div>

        {/* Navegación estilo Pokédex */}
        {pokemons.length > 0 && (
          <PokedexNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pokemons.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        )}

        {/* Contenedor de tarjetas con transición suave */}
        <div className="relative min-h-[500px]" ref={gridRef}>
          {/* Tarjetas de Pokémon - Grid de 5 columnas para 2 filas */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {pagePokemons.map((pokemon, index) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  index={index}
                  isFavorite={isFavorite ? isFavorite(pokemon.id) : false}
                  onToggleFavorite={onToggleFavorite}
                  onSelect={handleSelectPokemon}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-8 gap-3"
            >
              <Loader2 className="w-5 h-5 text-pokemon-red animate-spin" />
              <span className="text-white/60 text-sm">Loading more Pokemon...</span>
            </motion.div>
          )}
        </div>

        {/* Empty state */}
        {pokemons.length === 0 && !isLoadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/60 text-lg mb-4">
              No Pokemon found matching your criteria.
            </p>
            <button
              onClick={() => {
                onTypeToggle('all');
                onSearchChange('');
              }}
              className="px-6 py-3 bg-pokemon-red/20 hover:bg-pokemon-red/30 
                         text-pokemon-red rounded-full transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
    )}
    </>
  );
}
