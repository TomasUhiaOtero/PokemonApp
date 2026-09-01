import { useEffect, useState } from 'react';

/**
 * Tiers generados por `scripts/extract-hero-frames.mjs`. El directorio se llama
 * por su anchura porque el tier se elige por ancho de viewport, no por tipo de
 * dispositivo.
 */
const TIERS = [
  { minWidth: 768, dir: 1280, count: 96 },
  { minWidth: 0, dir: 640, count: 48 },
] as const;

/** Peticiones simultáneas. Suficiente para saturar la red sin ahogar el decodificador. */
const CONCURRENCY = 8;

export type FrameSequence = {
  /** `frames[i]` es `undefined` mientras ese frame no haya terminado de decodificarse. */
  frames: (HTMLImageElement | undefined)[];
  /** Frames ya decodificados. */
  loaded: number;
  total: number;
  /** El primer frame está listo: ya se puede pintar algo en el canvas. */
  isReady: boolean;
  /** La secuencia no se pudo cargar (p. ej. el navegador no decodifica AVIF). */
  failed: boolean;
};

function pickTier(): (typeof TIERS)[number] {
  // Ante una anchura desconocida (0 antes del primer layout, o sin `window`) se
  // asume el tier grande: servir 640px en un monitor se ve mal, mientras que
  // servir 1280px en un móvil solo cuesta ancho de banda.
  const width =
    (typeof window === 'undefined' ? 0 : window.innerWidth) ||
    globalThis.document?.documentElement.clientWidth ||
    TIERS[0].minWidth;
  // El tier se fija al montar: recargar 96 imágenes al redimensionar costaría
  // mucho más de lo que aporta afinar la resolución.
  return TIERS.find((tier) => width >= tier.minWidth) ?? TIERS[TIERS.length - 1];
}

function frameUrl(dir: number, index: number): string {
  return `/hero/frames/${dir}/f-${String(index).padStart(3, '0')}.avif`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

/**
 * Precarga la secuencia de frames del Hero.
 *
 * Devuelve el array con huecos en vez de esperar a tenerlo completo: quien
 * pinta puede recurrir al frame cargado más cercano y el Hero es utilizable
 * desde que llega el primero.
 */
export function useFrameSequence(enabled: boolean): FrameSequence {
  // El tier se calcula una sola vez y no vuelve a cambiar; `useState` con
  // inicializador perezoso lo fija sin leer una ref durante el render.
  const [tier] = useState(pickTier);

  const [state, setState] = useState<FrameSequence>(() => ({
    frames: new Array(tier.count).fill(undefined),
    loaded: 0,
    total: tier.count,
    isReady: false,
    failed: false,
  }));

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const frames: (HTMLImageElement | undefined)[] = new Array(tier.count).fill(undefined);
    let loaded = 0;
    let next = 1;

    async function fetchFrame(index: number): Promise<boolean> {
      try {
        frames[index] = await loadImage(frameUrl(tier.dir, index));
      } catch {
        if (!cancelled) setState((prev) => ({ ...prev, failed: true }));
        cancelled = true;
        return false;
      }
      if (cancelled) return false;
      loaded += 1;
      setState((prev) => ({ ...prev, frames, loaded, isReady: true }));
      return true;
    }

    async function worker() {
      while (!cancelled) {
        const index = next++;
        if (index >= tier.count) return;
        if (!(await fetchFrame(index))) return;
      }
    }

    // El frame 0 va primero y solo: permite pintar cuanto antes y, si el
    // navegador no decodifica AVIF, el fallo se detecta antes de disparar las
    // 95 peticiones restantes.
    void (async () => {
      if (!(await fetchFrame(0))) return;
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, tier]);

  return state;
}

/** Frame cargado más cercano a `index`, o `null` si aún no hay ninguno. */
export function nearestLoaded(
  frames: (HTMLImageElement | undefined)[],
  index: number
): HTMLImageElement | null {
  if (frames[index]) return frames[index];
  for (let offset = 1; offset < frames.length; offset += 1) {
    const before = frames[index - offset];
    if (before) return before;
    const after = frames[index + offset];
    if (after) return after;
  }
  return null;
}
