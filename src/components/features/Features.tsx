import { motion } from 'framer-motion';
import { Search, Map, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

const FEATURES: Feature[] = [
  {
    Icon: Search,
    title: 'Search & Filter',
    description: 'Find any Pokemon instantly with our powerful search and type filters.',
    delay: 0,
  },
  {
    Icon: Map,
    title: 'Pokedex Complete',
    description: 'Access comprehensive data for all 151+ original Pokemon.',
    delay: 0.1,
  },
  {
    Icon: Star,
    title: 'Favorites',
    description: 'Save your favorite Pokemon and build your dream team.',
    delay: 0.2,
  },
];

function FeatureCard({ Icon, title, description, delay }: Feature) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
    >
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pokemon-red to-pokemon-yellow flex items-center justify-center">
        <Icon className="text-white" size={28} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow">
            Everything You Need
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Powerful features to explore, track, and discover Pokemon like never before.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
