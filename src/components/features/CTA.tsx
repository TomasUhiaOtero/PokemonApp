import { motion } from 'framer-motion';

export function CTA() {
  return (
    <section className="py-32 px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 md:p-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pokemon-red/20 to-pokemon-yellow/20" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Catch 'Em All?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Start your Pokemon journey today. Explore, discover, and build your ultimate team.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-gradient-to-r from-pokemon-red to-pokemon-yellow text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-pokemon-red/40 transition-all"
          >
            Start Your Adventure
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
