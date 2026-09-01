import { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';

interface Feature {
  image: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/201.png',
    title: 'Search & Filter',
    description: 'Find any Pokemon instantly with our powerful search and type filters.',
  },
  {
    image: 'https://www.pngmart.com/files/23/Pokedex-PNG-Photo.png',
    title: 'Pokedex Complete',
    description: 'Access comprehensive data for all 151+ original Pokemon.',
  },
  {
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/370.png',
    title: 'Favorites',
    description: 'Save your favorite Pokemon and build your dream team.',
  },
];

function FeatureCard({ image, title, description, isActive }: Feature & { isActive: boolean }) {
  return (
    <div className={`flex-shrink-0 w-[85vw] max-w-[450px] glass rounded-3xl p-8 md:p-10 text-center transition-[opacity,transform] duration-500 ease-out mx-4 ${
      isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-90 pointer-events-none'
    }`}>
      <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-5 md:mb-6">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-contain drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
        />
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">{title}</h3>
      <p className="text-white/70 text-base md:text-lg leading-relaxed">{description}</p>
    </div>
  );
}

export function FeaturesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    if (emblaApi) {
      autoplayIntervalRef.current = setInterval(() => {
        emblaApi.scrollNext();
      }, 6000);
    }
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      resetAutoplay();
    }
  }, [emblaApi, resetAutoplay]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      resetAutoplay();
    }
  }, [emblaApi, resetAutoplay]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      resetAutoplay();
    }
  }, [emblaApi, resetAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    // Start autoplay
    autoplayIntervalRef.current = setInterval(() => {
      if (emblaApi) emblaApi.scrollNext();
    }, 6000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section id="features" className="py-32 px-4 relative z-10">
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

        <div className="relative">
          <div 
            ref={emblaRef} 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex-[0_0_100%] flex justify-center px-4"
                >
                  <FeatureCard 
                    {...feature} 
                    isActive={index === selectedIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              onClick={scrollPrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
            <motion.button
              onClick={scrollNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-3 rounded-full transition-[width,background-color] duration-300 ease-out cursor-pointer ${
                  index === selectedIndex 
                    ? 'bg-pokemon-red w-8' 
                    : 'bg-white/30 hover:bg-white/50 w-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
