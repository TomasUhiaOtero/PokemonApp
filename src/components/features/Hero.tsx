import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, ChevronDown, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Hero() {
  const { scrollY } = useScroll();
  const ref = useRef<HTMLDivElement>(null);
  
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const pokeballY = useTransform(scrollY, [0, 500], [0, -200]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      <motion.div 
        style={{ y: heroY, opacity: heroOpacity }} 
        className="text-center px-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Zap className="text-pokemon-yellow" size={16} />
          <span className="text-sm text-white/80">Gotta Catch 'Em All</span>
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          Discover the{' '}
          <span className="text-gradient">World</span>
          <br />
          of Pokemon
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          Explore the complete Pokedex with detailed stats, types, abilities, and more. 
          Your ultimate companion for every Pokemon journey.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-pokemon-red to-pokemon-yellow text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-pokemon-red/40 transition-all flex items-center gap-2"
          >
            Start Exploring
            <ArrowRight size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 glass text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all"
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: pokeballY }}
        className="absolute right-10 md:right-20 top-1/4 w-32 h-32 md:w-48 md:h-48 opacity-30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="pokeballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#pokeballGrad)" stroke="#1e293b" strokeWidth="2" />
          <rect x="2" y="46" width="96" height="8" fill="#1e293b" />
          <circle cx="50" cy="50" r="12" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="text-white/40" size={32} aria-hidden="true" />
        </motion.div>
      </motion.div>
    </section>
  );
}
