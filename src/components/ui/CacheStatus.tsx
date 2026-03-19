/**
 * Componente para mostrar el estado de la caché
 * Útil para debugging y mostrar al usuario que los datos se cargan rápido
 */

import { motion } from 'framer-motion';
import { Database, Zap, Clock } from 'lucide-react';

interface CacheStatusProps {
  isCached: boolean;
  age: number | null;
  onClearCache?: () => void;
}

export function CacheStatus({ isCached, age, onClearCache }: CacheStatusProps) {
  if (!isCached && age === null) return null;

  const formatAge = (ms: number | null): string => {
    if (ms === null) return 'Unknown';
    if (ms < 1000) return 'Just now';
    if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    return `${Math.floor(ms / 3600000)}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 glass rounded-full px-4 py-2 
                 flex items-center gap-3 text-sm"
    >
      {isCached ? (
        <>
          <Database className="w-4 h-4 text-green-400" />
          <span className="text-white/80">
            Loaded from cache
          </span>
          <span className="text-white/40">•</span>
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-white/60">{formatAge(age)}</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 text-pokemon-yellow" />
          <span className="text-white/80">Loading fresh data...</span>
        </>
      )}

      {onClearCache && (
        <>
          <span className="text-white/20">|</span>
          <button
            onClick={onClearCache}
            className="text-white/40 hover:text-white/80 transition-colors"
            title="Clear cache"
          >
            ✕
          </button>
        </>
      )}
    </motion.div>
  );
}
