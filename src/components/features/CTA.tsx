import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const TECHNOLOGIES = [
  { name: 'React', icon: '⚛️' },
  { name: 'Vite', icon: '⚡' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Framer Motion', icon: '✨' },
  { name: 'GSAP', icon: '🎬' },
  { name: 'Lucide Icons', icon: '💎' },
];

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/TomasUhiaOtero',
    icon: Github,
    color: 'hover:text-gray-300',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/tomás-uhía-otero-4407933a0',
    icon: Linkedin,
    color: 'hover:text-blue-400',
  },
  {
    name: 'Email',
    url: 'mailto:tomasuhiaotero@gmail.com',
    icon: Mail,
    color: 'hover:text-pokemon-red',
  },
];

export function CTA() {
  return (
    <section id="cta" className="py-32 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
            About This Project
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            A modern Pokemon discovery app built with passion. Explore the complete Pokedex,
            search by type, and save your favorite Pokemon.
          </p>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold text-white/80 mb-6 text-center">
            Technologies Used
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {TECHNOLOGIES.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass rounded-2xl px-5 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 ease-out cursor-default"
              >
                <span className="text-2xl">{tech.icon}</span>
                <span className="text-white font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Connect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Let's Connect
          </h3>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Interested in collaborating or have questions about this project? Feel free to reach out!
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {SOCIAL_LINKS.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`w-16 h-16 rounded-2xl glass flex items-center justify-center text-white/70 ${social.color} transition-colors cursor-pointer`}
                aria-label={social.name}
              >
                <social.icon size={28} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Made with Love */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-white/50 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="text-pokemon-red fill-pokemon-red" size={16} /> using React & PokeAPI
          </p>
        </motion.div>
      </div>
    </section>
  );
}
