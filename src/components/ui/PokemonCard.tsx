import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { TYPE_COLORS, FORM_STYLES } from '../../lib/constants';
import type { Pokemon } from '../../lib/types';
import { TypeIconSimple } from './TypeIcon';

const DEFAULT_TYPE_COLOR = '#6b7280';

interface PokemonCardProps {
  pokemon: Pokemon;
  index: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onSelect?: (pokemon: Pokemon) => void;
}

export const PokemonCard = memo(function PokemonCard({ 
  pokemon, 
  index, 
  isFavorite = false, 
  onToggleFavorite,
  onSelect
}: PokemonCardProps) {
  const reduce = useReducedMotion() ?? false;
  const primaryType = pokemon.types[0];
  const color = TYPE_COLORS[primaryType] || DEFAULT_TYPE_COLOR;

  const displayName = pokemon.formName
    ? pokemon.name.replace(/-[a-z0-9]+(-[a-z0-9]+)?$/g, '')
    : pokemon.name;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(pokemon.id);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(pokemon);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.3, ease: 'easeOut' }}
      viewport={{ once: true }}
      whileHover={reduce ? undefined : { y: -8, scale: 1.02 }}
      className="glass rounded-3xl p-6 cursor-pointer group relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
      onClick={handleCardClick}
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
            onClick={handleToggleFavorite}
            className={`transition-colors cursor-pointer ${
              isFavorite 
                ? 'text-pokemon-red' 
                : 'text-white/40 hover:text-pokemon-red'
            }`}
            aria-label={isFavorite 
              ? `Remove ${pokemon.name} from favorites` 
              : `Add ${pokemon.name} to favorites`
            }
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
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
          {pokemon.formName && (
            <div
              className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border flex items-center gap-1 shadow-lg"
              style={{
                background: FORM_STYLES[pokemon.formName.toLowerCase().replace(/\s+/g, '-')]?.bg || FORM_STYLES.default.bg,
                color: FORM_STYLES[pokemon.formName.toLowerCase().replace(/\s+/g, '-')]?.color || FORM_STYLES.default.color,
                borderColor: FORM_STYLES[pokemon.formName.toLowerCase().replace(/\s+/g, '-')]?.color || FORM_STYLES.default.color,
              }}
            >
              <Sparkles size={10} />
              {pokemon.formName}
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white text-center capitalize">
          {displayName}
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
