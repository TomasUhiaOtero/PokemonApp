import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { POKEMON_TYPES, TYPE_COLORS } from '../../lib/constants';
import type { PokemonType } from '../../lib/types';
import { TypeIconSimple } from './TypeIcon';
import './TypeFilter.css';

interface TypeFilterProps {
  activeTypes: PokemonType[];
  onTypeToggle: (type: PokemonType) => void;
  showFavoritesOnly?: boolean;
  onFavoritesToggle?: () => void;
  favoriteCount?: number;
}

export function TypeFilter({ 
  activeTypes, 
  onTypeToggle,
  showFavoritesOnly = false,
  onFavoritesToggle,
  favoriteCount = 0,
}: TypeFilterProps) {
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

      {/* Botón de Favoritos */}
      {onFavoritesToggle && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onFavoritesToggle}
          className={`
            type-filter-btn px-4 py-2 rounded-full text-sm font-medium 
            cursor-pointer flex items-center gap-2 relative
            ${showFavoritesOnly ? 'active text-white' : 'text-white/70'}
          `}
          style={{ 
            backgroundColor: showFavoritesOnly ? '#ef4444' : 'rgba(255,255,255,0.08)',
            borderColor: showFavoritesOnly ? '#ef4444' : 'transparent',
            boxShadow: showFavoritesOnly ? '0 4px 12px #ef444440' : 'none',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          role="checkbox"
          aria-checked={showFavoritesOnly}
          aria-label="Filter favorites"
        >
          <Heart 
            size={16} 
            className="relative z-10"
            fill={showFavoritesOnly ? 'currentColor' : 'none'}
          />
          <span className="relative z-10 flex items-center gap-1">
            Favorites
            {favoriteCount > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {favoriteCount}
              </span>
            )}
          </span>
        </motion.button>
      )}
    </div>
  );
}
