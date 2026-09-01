import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nearestLoaded, useFrameSequence } from '../../hooks/useFrameSequence';
import type { FrameSequence } from '../../hooks/useFrameSequence';

/** El zoom del canvas se limita a 2x para no pintar de más en pantallas 3x. */
const MAX_DPR = 2;

/**
 * Fracción de la distancia que el frame mostrado recorre hacia el objetivo en
 * cada fotograma. Más bajo = más suave y con más inercia; más alto = más pegado
 * al dedo. 0,18 asienta en unos 15 fotogramas, un cuarto de segundo.
 */
const SMOOTHING = 0.18;

/** Por debajo de esta distancia se da por llegado y se para el bucle. */
const FRAME_EPSILON = 0.004;

/** `--color-pokemon-dark`, en literal porque el canvas no lee variables CSS. */
const BACKDROP = '#0f172a';

/** `--color-pokemon-red` al 30 %, para el halo detrás de la escena. */
const GLOW = 'rgba(239, 68, 68, 0.3)';

const POSTER_OPEN = '/hero/poster-open.jpg';

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Hero sin scrub: la pokéball ya abierta, sin pin ni secuencia que precargar.
 * Es la versión que reciben quienes piden movimiento reducido y aquella en la
 * que cae el Hero si la secuencia no se puede cargar.
 */
function StaticHero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <img
        src={POSTER_OPEN}
        alt="Pokédex mostrando a Pikachu tras abrirse la Poké Ball"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-pokemon-dark via-pokemon-dark/40 to-transparent" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end pb-20">
        <h1 className="text-gradient text-shadow-glow text-5xl font-bold tracking-wider md:text-7xl">
          POKEMON
        </h1>
        <button
          onClick={scrollToFeatures}
          className="mt-8 cursor-pointer rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-yellow"
          aria-label="Ir a la sección de características"
        >
          <ChevronDown className="text-white/40 transition-colors hover:text-white/60" size={32} />
        </button>
      </div>
    </section>
  );
}

/**
 * Decide qué Hero toca. La secuencia se pide desde aquí porque su resultado
 * elige entre las dos ramas, y `ScrubHero` solo se monta cuando de verdad va a
 * haber scrub: `useScroll` exige que su `target` acabe en el DOM y lanzaría
 * «Target ref is defined but not hydrated» si viviera en la rama estática.
 */
export function Hero() {
  const reduce = useReducedMotion() ?? false;
  const sequence = useFrameSequence(!reduce);

  if (reduce || sequence.failed) return <StaticHero />;
  return <ScrubHero sequence={sequence} />;
}

function ScrubHero({ sequence }: { sequence: FrameSequence }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Los textos cuelgan de este valor y no de `scrollYProgress` directamente.
  // Framer acelera las cadenas que nacen de `useScroll` con una ScrollTimeline
  // nativa, y esa vía resuelve el rango contra el scroll del documento entero
  // en lugar de contra la sección: los textos se desincronizaban del canvas.
  // Alimentándolo desde el mismo listener, ambos comparten origen.
  const progress = useMotionValue(0);
  const titleOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const titleY = useTransform(progress, [0, 0.12], [0, -40]);
  const outroOpacity = useTransform(progress, [0.88, 1], [0, 1]);
  const [outroMounted, setOutroMounted] = useState(false);

  // El scrub repinta a 60 fps: pasar el frame por estado de React dispararía un
  // render por fotograma, así que la animación vive entera en refs.
  //
  // `target` es el frame que pide el scroll y `shown` el que se está pintando.
  // `shown` persigue a `target` en vez de saltar a él, y ambos son decimales:
  // el índice se usa para mezclar dos frames contiguos, no para redondear al
  // más cercano. Con 96 frames en ~1440 px de scroll cada uno aguantaría unos
  // 15 px, que es lo que se veía a saltos.
  const targetRef = useRef(0);
  const shownRef = useRef(0);
  const rafRef = useRef(0);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const last = sequence.total - 1;
    const base = Math.min(last, Math.max(0, Math.floor(index)));
    const blend = index - base;
    const from = nearestLoaded(sequence.frames, base);
    if (!from) return;

    ctx.imageSmoothingQuality = 'high';
    const { width, height } = canvas;

    // Fondo opaco en vez de transparente: al no llenar la pantalla, por los
    // lados asomaba el AnimatedBackground y la escena parecía pegada encima.
    ctx.globalAlpha = 1;
    ctx.fillStyle = BACKDROP;
    ctx.fillRect(0, 0, width, height);

    // Nunca se amplía por encima del tamaño nativo: el vídeo maestro es 720p y
    // estirarlo a pantalla completa en un monitor grande es justo lo que lo
    // volvía blando. Por debajo de 1x sí se reduce, para caber.
    const scale = Math.min(1, Math.max(width / from.width, height / from.height));
    const w = from.width * scale;
    const h = from.height * scale;
    const x = (width - w) / 2;
    const y = (height - h) / 2;

    // Halo detrás de la escena, dibujado una sola vez: asienta el recuadro
    // sobre el fondo y evita el corte seco contra el vacío.
    if (w < width || h < height) {
      ctx.save();
      ctx.shadowColor = GLOW;
      ctx.shadowBlur = Math.round(80 * scale);
      ctx.fillStyle = BACKDROP;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
    }

    const draw = (image: HTMLImageElement, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, x, y, w, h);
    };

    draw(from, 1);
    // El segundo frame se funde encima con la parte decimal del índice, que es
    // lo que da continuidad entre fotogramas en vez de un corte seco.
    if (blend > 0.01 && base < last) {
      const to = sequence.frames[base + 1];
      if (to) draw(to, blend);
    }
    ctx.globalAlpha = 1;
  }, [sequence.frames, sequence.total]);

  // Bucle de amortiguación. Solo corre mientras quede distancia que recorrer:
  // en reposo no consume nada. El paso es una función interna y no un
  // `useCallback` aparte porque tiene que reprogramarse a sí misma.
  const schedulePaint = useCallback(() => {
    if (rafRef.current) return;

    const last = Math.max(1, sequence.total - 1);

    function step() {
      const distance = targetRef.current - shownRef.current;
      const arrived = Math.abs(distance) < FRAME_EPSILON;

      shownRef.current = arrived ? targetRef.current : shownRef.current + distance * SMOOTHING;
      paint(shownRef.current);
      // Los textos siguen al frame amortiguado, no al scroll en crudo, para que
      // no se adelanten a la imagen.
      progress.set(shownRef.current / last);

      rafRef.current = arrived ? 0 : requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
  }, [paint, progress, sequence.total]);

  // El canvas se dimensiona en píxeles de dispositivo; con el tamaño CSS solo
  // se vería borroso al escalar.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      paint(shownRef.current); // redimensionar vacía el canvas
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  // Repintar cuando llegan frames nuevos: el que se está mostrando puede ser un
  // vecino cargado antes que el que de verdad tocaba.
  useEffect(() => {
    paint(shownRef.current);
  }, [sequence.frames, sequence.loaded, paint]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setOutroMounted(value >= 0.88);
    targetRef.current = Math.min(1, Math.max(0, value)) * (sequence.total - 1);
    schedulePaint();
  });

  // El identificador se limpia además de cancelarse: sin eso, el remontaje que
  // hace StrictMode en desarrollo deja `rafRef` con un id ya cancelado y
  // `schedulePaint` se cree que siempre hay un repintado en cola.
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    },
    []
  );

  // h-[300vh]: el primer 100vh es el pin y el resto es el recorrido del scrub.
  // Deja ~19 px de scroll por frame en un viewport de 900 px, o sea unos 5
  // frames por muesca de rueda.
  return (
    <section id="top" ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Poké Ball abriéndose para revelar a Pikachu conforme avanza el scroll"
        />

        {/* Velo inferior. Tiene que ser opaco de verdad en la base: al no
            ampliar la escena, en un portátil el texto cae justo sobre la barra
            de navegación iluminada de la Pokédex y con un velo suave se perdía. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-pokemon-dark via-pokemon-dark/85 to-transparent" />

        {/* Entrada y salida comparten anclaje: el bloque inferior no se mueve,
            solo cambia lo que contiene. */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="absolute inset-x-0 bottom-14 z-10 px-6 text-center"
        >
          <h1 className="text-gradient text-shadow-glow text-5xl font-bold tracking-wider md:text-7xl">
            POKEMON
          </h1>
          <p className="mt-3 text-sm tracking-[0.3em] text-white/50 uppercase">
            Desplázate para abrir
          </p>
        </motion.div>

        {/* Se monta al llegar al final en vez de quedarse con opacidad 0: un
            botón invisible seguiría siendo enfocable con el tabulador. */}
        {outroMounted && (
          <motion.div
            style={{ opacity: outroOpacity }}
            className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-2"
          >
            <p className="text-sm tracking-[0.3em] text-white/60 uppercase">Pokédex lista</p>
            <button
              onClick={scrollToFeatures}
              className="cursor-pointer rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-yellow"
              aria-label="Ir a la sección de características"
            >
              <ChevronDown className="text-white/40 transition-colors hover:text-white/60" size={32} />
            </button>
          </motion.div>
        )}

        <LoadingBar loaded={sequence.loaded} total={sequence.total} />
      </div>
    </section>
  );
}

/**
 * Barra de progreso de la precarga. Desaparece en cuanto la secuencia está
 * completa; hasta entonces el scrub funciona igual, pintando el frame cargado
 * más cercano.
 */
function LoadingBar({ loaded, total }: { loaded: number; total: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (loaded < total) return;
    const timer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(timer);
  }, [loaded, total]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/10"
      role="progressbar"
      aria-label="Cargando la secuencia del Hero"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={loaded}
    >
      <motion.div
        className="h-full bg-pokemon-red"
        initial={false}
        animate={{ scaleX: loaded / total, opacity: loaded === total ? 0 : 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
}
