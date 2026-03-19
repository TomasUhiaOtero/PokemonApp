import { motion } from 'framer-motion';
import { POKEMON_TYPES, TYPE_COLORS } from '../../lib/constants';
import type { PokemonType } from '../../lib/types';
import { TypeIconSimple } from './TypeIcon';
import './TypeFilter.css';

interface TypeFilterProps {
  activeTypes: PokemonType[];
  onTypeToggle: (type: PokemonType) => void;
}

export function TypeFilter({ activeTypes, onTypeToggle }: TypeFilterProps) {
  const isAllSelected = activeTypes.length === 0;

  return (
    <div 
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label="Filter by Pokemon type"
    >
      {POKEMON_TYPES.map((type) => {
        const typeColor = TYPE_COLORS[type] || '#6b7280';
        const isActive = type === 'all' ? isAllSelected : activeTypes.includes(type);

        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTypeToggle(type)}
            className={`
              type-filter-btn px-4 py-2 rounded-full text-sm font-medium 
              cursor-pointer flex items-center gap-2 relative
              ${isActive ? 'active text-white' : 'text-white/70'}
            `}
            style={{ 
              backgroundColor: isActive ? typeColor : 'rgba(255,255,255,0.08)',
              borderColor: isActive ? typeColor : 'transparent',
              boxShadow: isActive ? `0 4px 12px ${typeColor}40` : 'none',
              ['--type-color' as string]: typeColor,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            role="checkbox"
            aria-checked={isActive}
            aria-label={`${type} type filter`}
          >
            <span className="relative z-10">
              <TypeIconSimple type={type} size={16} />
            </span>
            <span className="capitalize relative z-10">
              {type}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
