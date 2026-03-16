import { motion, AnimatePresence } from 'framer-motion';
import { PokemonCard, TypeFilter, SearchInput } from '../ui';
import type { Pokemon, PokemonType } from '../../lib/types';

interface PokemonGridProps {
  pokemons: Pokemon[];
  activeType: PokemonType;
  searchQuery: string;
  onTypeChange: (type: PokemonType) => void;
  onSearchChange: (query: string) => void;
}

export function PokemonGrid({
  pokemons,
  activeType,
  searchQuery,
  onTypeChange,
  onSearchChange,
}: PokemonGridProps) {
  return (
    <section id="pokemons" className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10"
        >
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <TypeFilter activeType={activeType} onTypeChange={onTypeChange} />
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {pokemons.map((pokemon, index) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {pokemons.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/60 text-lg">
              No Pokemon found matching your criteria.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
