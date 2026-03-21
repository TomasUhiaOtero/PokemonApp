import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';

const POKEMON_GIFS = [
  {
    src: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDFhY2VkMWM3OGg3ajlhcG5odGJscmV2bnNtNm55M3o1MHY0ZWZudyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/z8OcWLLk4SrpS/giphy.gif',
    alt: 'Animated Pikachu in Pokemon game',
  },
  {
    src: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3c28xZmE0N29mbW50b2c5Y216b2g3d2RxcjJtcjZpeDR5MjMycDgwayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/FX5aKofPgom36xXCSe/giphy.gif',
    alt: 'Pokemon battle animation',
  },
  {
    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmc0ZzJzZTFyemhndWFmZW1vamVpeWszcnFrazdpZjR6bXg5MGluayZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/AQl0NdNJLEq7BPnX8E/giphy.gif',
    alt: 'Pokemon trainer animation',
  },
];

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.45, 0, 0.55, 1] as const,
    },
  },
};

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
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-shadow"
        >
          Discover the{' '}
          <span className="text-gradient text-shadow-glow">World</span>
          <br />
          of Pokemon
        </motion.h1>

        {/* Pokemon GIFs Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6"
        >
          {POKEMON_GIFS.map((gif, index) => (
            <motion.div
              key={gif.src}
              variants={floatVariants}
              initial="initial"
              animate="animate"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <img
                src={gif.src}
                alt={gif.alt}
                className={`object-cover rounded-lg ${
                  index === 0 
                    ? 'w-36 h-36 md:w-48 md:h-48' 
                    : 'w-28 h-28 md:w-36 md:h-36'
                }`}
                loading="lazy"
              />
            </motion.div>
          ))}
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
        <motion.button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-yellow rounded-full p-2"
          aria-label="Scroll to features section"
        >
          <ChevronDown className="text-white/40 hover:text-white/60 transition-colors" size={32} />
        </motion.button>
      </motion.div>
    </section>
  );
}
