import { usePokemon, usePokemonFilter } from './hooks/usePokemon';
import { Header, Hero, Features, PokemonGrid, CTA, Footer } from './components/features';
import { AnimatedBackground } from './components/layout';

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

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-pokemon-red mb-4">Oops!</h1>
        <p className="text-white/60">{message}</p>
      </div>
    </div>
  );
}

function App() {
  const { pokemons, isLoading, error } = usePokemon();
  const { 
    activeType, 
    searchQuery, 
    filteredPokemons, 
    handleTypeChange, 
    handleSearchChange 
  } = usePokemonFilter(pokemons);

  if (error) {
    return (
      <>
        <AnimatedBackground />
        <ErrorView message={error} />
      </>
    );
  }

  if (isLoading || pokemons.length === 0) {
    return (
      <>
        <AnimatedBackground />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Header />
      <Hero />
      <Features />
      <PokemonGrid
        pokemons={filteredPokemons}
        activeType={activeType}
        searchQuery={searchQuery}
        onTypeChange={handleTypeChange}
        onSearchChange={handleSearchChange}
      />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
