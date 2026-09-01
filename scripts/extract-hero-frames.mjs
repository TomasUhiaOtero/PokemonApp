#!/usr/bin/env node
/**
 * Extrae la secuencia de frames del Hero a partir del vídeo maestro.
 *
 * El Hero no reproduce el .mp4: el scroll elige qué imagen se pinta en un
 * <canvas>. El vídeo original tiene un único keyframe, así que hacer scrub
 * con `video.currentTime` obligaría a decodificar desde el frame 0 en cada
 * seek. Con una secuencia de imágenes el coste por frame es constante.
 *
 * Uso:
 *   node scripts/extract-hero-frames.mjs
 *
 * Requiere ffmpeg en el PATH (winget install Gyan.FFmpeg). En Windows hay que
 * parar antes el servidor de desarrollo: su watcher mantiene abiertos los
 * archivos de `public/` y la reescritura falla a mitad.
 * Los frames generados se versionan: este script solo hace falta para
 * regenerarlos si cambia el vídeo maestro.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'assets-src', 'hero-pokeball.mp4');
const OUT_DIR = join(ROOT, 'public', 'hero');

/** Frames del vídeo maestro (10,005 s a 24 fps). */
const SOURCE_FRAMES = 240;

/**
 * Cada tier muestrea `count` frames repartidos uniformemente sobre el vídeo.
 * El directorio se llama por su anchura porque el tier se elige por ancho de
 * viewport, no por tipo de dispositivo. `crf` es la calidad de AV1: más bajo =
 * mejor y más pesado.
 *
 * Estos valores salen de medir SSIM contra el frame original sin comprimir.
 * A 1280 px, crf 38 daba 0,948 y se notaba: bandeado en las zonas oscuras y los
 * medios tonos emborronados al ampliar en un monitor grande, porque el vídeo
 * maestro es 720p y ahí ya se está escalando. crf 26 sube a 0,969, que a 3x de
 * aumento es casi indistinguible del original. El tier de 640 se queda en crf 30
 * (0,960): con `MAX_DPR` en 2, en un móvil el canvas amplía solo ~1,2x y los
 * artefactos se notan bastante menos.
 */
const TIERS = [
  { count: 96, width: 1280, height: 720, crf: 26 },
  { count: 48, width: 640, height: 360, crf: 30 },
];

/** Índices equiespaciados en [0, SOURCE_FRAMES - 1], extremos incluidos. */
function sampleIndices(count) {
  const last = SOURCE_FRAMES - 1;
  return Array.from({ length: count }, (_, i) =>
    Math.round((i * last) / (count - 1))
  );
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'ignore'] });
}

/** Vacía un directorio sin borrarlo. */
function emptyDir(dir) {
  // Se limpian los archivos en vez de borrar el directorio: en Windows el
  // borrado de un directorio queda pendiente mientras algún handle siga
  // abierto, y recrearlo entonces falla con EPERM.
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) rmSync(join(dir, f), { force: true, recursive: true });
}

function report(label, dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.avif'));
  const bytes = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
  console.log(
    `${label}: ${files.length} frames, ${(bytes / 1024 / 1024).toFixed(2)} MB ` +
      `(${(bytes / files.length / 1024).toFixed(1)} KB/frame)`
  );
  return files.length;
}

function extractTier({ count, width, height, crf }, work) {
  const dir = join(OUT_DIR, 'frames', String(width));
  emptyDir(dir);

  const rawDir = join(work, String(width));
  mkdirSync(rawDir, { recursive: true });

  // Una sola pasada de decodificación para todo el tier: `select` deja pasar
  // los frames elegidos y ffmpeg los numera correlativamente. El vídeo solo
  // tiene un keyframe, así que buscar cada frame por separado obligaría a
  // decodificar desde el principio 96 veces.
  const select = sampleIndices(count).map((n) => `eq(n\\,${n})`).join('+');
  ffmpeg([
    '-i', SOURCE,
    '-vf', `select='${select}',scale=${width}:${height}`,
    '-fps_mode', 'passthrough',
    join(rawDir, 'f-%03d.png'),
  ]);

  // El muxer avif agrupa una secuencia en un único archivo animado, así que
  // cada frame se codifica en su propia invocación.
  const raws = readdirSync(rawDir).filter((f) => f.endsWith('.png')).sort();
  for (const [i, raw] of raws.entries()) {
    ffmpeg([
      '-i', join(rawDir, raw),
      '-c:v', 'libsvtav1', '-crf', String(crf), '-f', 'avif',
      join(dir, `f-${String(i).padStart(3, '0')}.avif`),
    ]);
  }

  const written = report(`${width}px`, dir);
  if (written !== count) {
    throw new Error(`${width}px: se esperaban ${count} frames y salieron ${written}`);
  }
}

/**
 * Póster de carga (pokéball cerrada) y frame estático para
 * `prefers-reduced-motion` (pokéball abierta). Se sacan del propio vídeo para
 * que encajen al píxel con la secuencia.
 */
function extractPosters(work) {
  mkdirSync(OUT_DIR, { recursive: true });
  const posters = [
    { frame: 0, name: 'poster-closed' },
    { frame: SOURCE_FRAMES - 1, name: 'poster-open' },
  ];

  for (const { frame, name } of posters) {
    const raw = join(work, `${name}.png`);
    ffmpeg([
      '-i', SOURCE,
      '-vf', `select='eq(n\\,${frame})'`,
      '-fps_mode', 'passthrough', '-frames:v', '1',
      raw,
    ]);
    // AVIF para el navegador; JPG como red de seguridad en <img> y en tests.
    // Los pósters son dos archivos sueltos y uno de ellos es todo lo que ve
    // quien pide movimiento reducido, así que van más finos que la secuencia.
    ffmpeg(['-i', raw, '-c:v', 'libsvtav1', '-crf', '24', '-f', 'avif',
      join(OUT_DIR, `${name}.avif`)]);
    ffmpeg(['-i', raw, '-q:v', '4', join(OUT_DIR, `${name}.jpg`)]);
  }
  console.log('posters: poster-closed y poster-open (.avif + .jpg)');
}

const work = mkdtempSync(join(tmpdir(), 'hero-frames-'));
try {
  for (const tier of TIERS) extractTier(tier, work);
  extractPosters(work);
} finally {
  rmSync(work, { recursive: true, force: true });
}
