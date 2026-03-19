import { useEffect, lazy, Suspense } from 'react';
import { usePokemonOptimized, usePokemonFilter, pokemonApi } from './hooks/usePokemon';
import { Hero, Features, PokemonGrid, CTA, Footer } from './components/features';
import { CacheStatus, FluidNavigation } from './components/ui';

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
  useEffect(() => {
    pokemonApi.cleanOldGenerationsCache();
  }, []);

  const {
    pokemons,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalLoaded,
    totalCount,
    loadMore,
    refresh,
    cacheStatus,
  } = usePokemonOptimized();

  const {
    activeTypes,
    searchQuery,
    filteredPokemons,
    handleTypeToggle,
    handleSearchChange,
  } = usePokemonFilter(pokemons);

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

  if (isLoading && pokemons.length === 0) {
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
      <FluidNavigation />
      <Hero />
      <Features />
      <PokemonGrid
        pokemons={filteredPokemons}
        activeTypes={activeTypes}
        searchQuery={searchQuery}
        onTypeToggle={handleTypeToggle}
        onSearchChange={handleSearchChange}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
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
