import { useEffect, lazy, Suspense, useState } from 'react';
import { usePokemonOptimized, usePokemonFilter, useFavorites, pokemonApi } from './hooks/usePokemon';
import { Hero, FeaturesCarousel, PokemonGrid, CTA, Footer } from './components/features';
import { CacheStatus, StaggeredMenu } from './components/ui';
import { DEFAULT_GENERATION } from './lib/constants';

const AnimatedBackground = lazy(() => 
  import('./components/layout/AnimatedBackground').then(m => ({ default: m.AnimatedBackground }))
);

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-pokemon-red border-t-transparent animate-spin" />
        <p className="text-white/60 text-lg">Catching Pokemon...</p>
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-pokemon-red mb-4">Oops!</h1>
        <p className="text-white/60 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-pokemon-red/20 hover:bg-pokemon-red/30 
                       text-pokemon-red rounded-full transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const [selectedGeneration, setSelectedGeneration] = useState(DEFAULT_GENERATION);

  const {
    pokemons,
    isLoading,
    isSwitchingGeneration,
    isLoadingMore,
    error,
    hasMore,
    totalLoaded,
    totalCount,
    loadMore,
    refresh,
    cacheStatus,
    allPokemonNames,
  } = usePokemonOptimized({ generation: selectedGeneration });

  const { 
    favoriteIds, 
    isFavorite, 
    toggleFavorite, 
    favoriteCount 
  } = useFavorites();

  const {
    activeTypes,
    searchQuery,
    showFavoritesOnly,
    filteredPokemons,
    isSearching,
    handleTypeToggle,
    handleFavoritesToggle,
    handleSearchChange,
    resetFilters,
  } = usePokemonFilter({ pokemons, favoriteIds: new Set([...favoriteIds]), allPokemonNames });

  // Resetear filtros cuando cambia la generación
  useEffect(() => {
    resetFilters();
  }, [selectedGeneration]);

  if (error && pokemons.length === 0) {
    return (
      <>
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        <ErrorView message={error} onRetry={refresh} />
      </>
    );
  }

  if (isLoading && pokemons.length === 0 && !isSwitchingGeneration) {
    return (
      <>
        <Suspense fallback={null}>
          <AnimatedBackground />
        </Suspense>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      <StaggeredMenu
        position="right"
        colors={['#ef4444', '#eab308']}
        accentColor="#ef4444"
        menuButtonColor="#ffffff"
        displayItemNumbering={true}
        isFixed={true}
        closeOnClickAway={true}
        items={[
          { label: 'Home', link: '#top', ariaLabel: 'Go to Home' },
          { label: 'Features', link: '#features', ariaLabel: 'Go to Features' },
          { label: 'Pokedex', link: '#pokemons', ariaLabel: 'Go to Pokedex' },
          { label: 'About', link: '#cta', ariaLabel: 'Go to About' },
        ]}
      />
      <Hero />
      <FeaturesCarousel />
      <PokemonGrid
        pokemons={filteredPokemons}
        activeTypes={activeTypes}
        searchQuery={searchQuery}
        onTypeToggle={handleTypeToggle}
        onSearchChange={handleSearchChange}
        generation={selectedGeneration}
        onGenerationChange={setSelectedGeneration}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesToggle={handleFavoritesToggle}
        favoriteCount={favoriteCount}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        isSwitchingGeneration={isSwitchingGeneration}
        onLoadMore={loadMore}
        totalLoaded={totalLoaded}
        totalCount={totalCount}
      />
      <CTA />
      <Footer />
      
      <CacheStatus
        isCached={cacheStatus.isCached}
        age={cacheStatus.age}
        onClearCache={() => {
          pokemonApi.clearCache();
          refresh();
        }}
      />
    </div>
  );
}

export default App;
