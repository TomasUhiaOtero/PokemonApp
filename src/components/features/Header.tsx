import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const NAV_ITEMS = ['Features', 'Pokemons', 'About'];

export function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pokemon-red to-pokemon-yellow flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-white text-shadow">Pokedex</span>
        </motion.div>
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_ITEMS.map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-white/90 hover:text-white transition-colors text-sm font-medium text-shadow"
            >
              {item}
            </motion.a>
          ))}
        </nav>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-gradient-to-r from-pokemon-red to-pokemon-red/80 text-white rounded-full font-medium text-sm hover:shadow-lg hover:shadow-pokemon-red/30 transition-all"
        >
          Get Started
        </motion.button>
      </div>
    </motion.header>
  );
}
