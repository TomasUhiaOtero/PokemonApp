import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FLOATING_PARTICLES = 20;
const ENERGY_LINES = 4;
const LIGHT_BUBBLES = 15;

const MIN_PARTICLE_SIZE = 35;
const SIZE_INCREMENT = 8;
const HORIZONTAL_MARGIN = 3;
const HORIZONTAL_STEP = 7;
const MAX_HORIZONTAL_POSITION = 94;
const VERTICAL_MARGIN = 5;
const VERTICAL_STEP = 11;
const MAX_VERTICAL_POSITION = 85;
const MIN_RANGE_X = 10;
const RANGE_X_INCREMENT = 4;
const MIN_RANGE_Y = 8;
const RANGE_Y_INCREMENT = 3;
const MIN_DURATION = 8;
const DURATION_INCREMENT = 1.5;
const MIN_OPACITY = 0.35;
const OPACITY_INCREMENT = 0.05;

const MIN_BUBBLE_SIZE = 3;
const BUBBLE_SIZE_INCREMENT = 4;
const MIN_BUBBLE_DURATION = 10;
const BUBBLE_DURATION_INCREMENT = 2;

const PARTICLE_CONFIG = Array.from({ length: FLOATING_PARTICLES }, (_, i) => ({
  id: i,
  size: MIN_PARTICLE_SIZE + (i % 5) * SIZE_INCREMENT,
  left: HORIZONTAL_MARGIN + (i * HORIZONTAL_STEP) % MAX_HORIZONTAL_POSITION,
  top: VERTICAL_MARGIN + (i * VERTICAL_STEP) % MAX_VERTICAL_POSITION,
  rangeX: MIN_RANGE_X + (i % 5) * RANGE_X_INCREMENT,
  rangeY: MIN_RANGE_Y + (i % 4) * RANGE_Y_INCREMENT,
  duration: MIN_DURATION + (i % 5) * DURATION_INCREMENT,
  delay: -(i * 2),
  opacityPeak: MIN_OPACITY + (i % 4) * OPACITY_INCREMENT,
}));

const BUBBLE_CONFIG = Array.from({ length: LIGHT_BUBBLES }, (_, i) => ({
  id: i,
  size: MIN_BUBBLE_SIZE + (i % 4) * BUBBLE_SIZE_INCREMENT,
  left: HORIZONTAL_MARGIN + (i * 6.5) % MAX_HORIZONTAL_POSITION,
  duration: MIN_BUBBLE_DURATION + (i % 10) * BUBBLE_DURATION_INCREMENT,
  delay: -(i * 1.5),
}));

const LINE_CONFIG = Array.from({ length: ENERGY_LINES }, (_, i) => ({
  id: i,
  top: 15 + i * 20,
  duration: 18 + i * 4,
  delay: -(i * 6),
}));

type ParticleProps = (typeof PARTICLE_CONFIG)[number];
type BubbleProps = (typeof BUBBLE_CONFIG)[number];
type LineProps = (typeof LINE_CONFIG)[number];

function FloatingParticle({ size, left, top, rangeX, rangeY, duration, delay, opacityPeak }: ParticleProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ 
        left: `${left}%`, 
        top: `${top}%` 
      }}
      animate={{
        x: [0, rangeX, 0, -rangeX, 0],
        y: [0, rangeY / 2, rangeY, rangeY / 2, 0],
        opacity: [0, opacityPeak, opacityPeak * 1.5, opacityPeak, 0],
        scale: [0.6, 1, 1, 1, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2.5" />
        <line x1="2" y1="20" x2="38" y2="20" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="5" fill="rgba(255, 255, 255, 0.6)" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}

function EnergyLine({ top, duration, delay }: LineProps) {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{ 
        top: `${top}%`,
        background: 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.2) 50%, transparent 100%)',
      }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        scaleX: [0, 1, 1, 0],
        x: ['-100%', '100%'],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function LightBubble({ size, left, duration, delay }: BubbleProps) {
  const [maxHeight, setMaxHeight] = useState(500);
  
  useEffect(() => {
    setMaxHeight(window.innerHeight * 0.5);
  }, []);
  
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: 0,
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
      }}
      animate={{
        y: [0, -maxHeight],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function AnimatedGradient() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background: [
          'radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 20%, rgba(234, 179, 8, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(239, 68, 68, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.07) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(234, 179, 8, 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        ],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.015]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
  );
}

function GlowOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-20 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-40 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </>
  );
}

export function AnimatedBackground() {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ position: 'fixed', zIndex: -1 }}
    >
      <div className="absolute inset-0 bg-pokemon-dark" />
      <AnimatedGradient />
      <GridPattern />
      <GlowOrbs />
      {BUBBLE_CONFIG.map((config) => (
        <LightBubble key={`bubble-${config.id}`} {...config} />
      ))}
      {LINE_CONFIG.map((config) => (
        <EnergyLine key={`line-${config.id}`} {...config} />
      ))}
      {PARTICLE_CONFIG.map((config) => (
        <FloatingParticle key={`particle-${config.id}`} {...config} />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.04) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
