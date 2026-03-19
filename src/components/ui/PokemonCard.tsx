import { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { TYPE_COLORS } from '../../lib/constants';
import type { Pokemon } from '../../lib/types';
import { TypeIconSimple } from './TypeIcon';

const DEFAULT_TYPE_COLOR = '#6b7280';

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
}

export const PokemonCard = memo(function PokemonCard({ pokemon, index }: PokemonCardProps) {
  const primaryType = pokemon.types[0];
  const color = TYPE_COLORS[primaryType] || DEFAULT_TYPE_COLOR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
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
        
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {pokemon.types.map((type) => {
            const typeColor = TYPE_COLORS[type] || DEFAULT_TYPE_COLOR;
            return (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white capitalize border border-white/20 gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
                  boxShadow: `0 2px 8px ${typeColor}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  minWidth: '80px',
                  justifyContent: 'center',
                }}
              >
                <TypeIconSimple type={type} size={14} />
                <span>{type}</span>
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});
