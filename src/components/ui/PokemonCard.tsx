import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { TYPE_COLORS } from '../../lib/constants';
import type { Pokemon } from '../../lib/types';

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
}

export function PokemonCard({ pokemon, index }: PokemonCardProps) {
  const color = TYPE_COLORS[pokemon.types[0]] || '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass rounded-3xl p-6 cursor-pointer group relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
    >
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" 
        style={{ background: color }} 
      />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm text-white/50 font-medium">
            #{String(pokemon.number).padStart(3, '0')}
          </span>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-white/40 hover:text-pokemon-yellow transition-colors"
            aria-label={`Add ${pokemon.name} to favorites`}
          >
            <Heart size={20} />
          </motion.button>
        </div>
        <div
          className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
          style={{ background: `${color}20` }}
        >
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.number}.png`}
            alt={`${pokemon.name} sprite`}
            className="w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <h3 className="text-lg font-semibold text-white text-center capitalize">
          {pokemon.name}
        </h3>
        <div className="flex justify-center gap-2 mt-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ background: color }}
          >
            {pokemon.types[0]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
