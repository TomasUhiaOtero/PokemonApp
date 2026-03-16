import { motion } from 'framer-motion';
import { POKEMON_TYPES } from '../../lib/constants';
import type { PokemonType } from '../../lib/types';

interface TypeFilterProps {
  activeType: PokemonType;
  onTypeChange: (type: PokemonType) => void;
}

const TYPE_COLORS: Record<string, string> = {
  all: '#6b7280',
  fire: '#ef4444',
  water: '#3b82f6',
  grass: '#22c55e',
  electric: '#eab308',
  psychic: '#ec4899',
  ice: '#06b6d4',
  dragon: '#8b5cf6',
  dark: '#1e293b',
  fairy: '#f472b6',
};

export function TypeFilter({ activeType, onTypeChange }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {POKEMON_TYPES.map((type) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTypeChange(type)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            activeType === type ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
          style={{ 
            background: activeType === type ? TYPE_COLORS[type] : 'rgba(255,255,255,0.1)' 
          }}
          aria-pressed={activeType === type}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </motion.button>
      ))}
    </div>
  );
}
