import { memo } from 'react';
import { motion } from 'framer-motion';
import { GENERATIONS } from '../../lib/constants';
import type { Generation } from '../../lib/types';

interface GenerationSelectorProps {
  generation: number;
  onGenerationChange: (gen: number) => void;
}

export const GenerationSelector = memo(function GenerationSelector({
  generation,
  onGenerationChange,
}: GenerationSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-wrap justify-center gap-2">
        {(GENERATIONS as unknown as Generation[]).map((gen) => (
          <button
            key={gen.id}
            onClick={() => onGenerationChange(gen.id)}
            className={`
              relative px-3 py-2 rounded-xl text-sm font-medium
              transition-[background-color,border-color,color,box-shadow] duration-300 ease-out border cursor-pointer
              ${
                generation === gen.id
                  ? 'bg-pokemon-red/20 border-pokemon-red/50 text-pokemon-red shadow-lg shadow-pokemon-red/10'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
              }
            `}
            aria-pressed={generation === gen.id}
          >
            <span className="block leading-tight">{gen.name}</span>
            <span className="block text-[10px] opacity-70 leading-tight">{gen.region}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
});
