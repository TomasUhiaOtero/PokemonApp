import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: 'left' | 'right';
  yoyo?: boolean;
  pauseOnHover?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ShinyText({
  text,
  speed = 3,
  delay = 0,
  color = '#ffffff',
  shineColor = '#ff1414',
  spread = 15,
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
  disabled = false,
  className = '',
}: ShinyTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (disabled || !textRef.current) return;

    const element = textRef.current;
    
    // Set initial color
    element.style.color = color;
    element.style.backgroundImage = `linear-gradient(90deg, ${color} 0%, ${shineColor} 50%, ${color} 100%)`;
    element.style.backgroundSize = '200% 100%';
    element.style.backgroundClip = 'text';
    element.style.webkitBackgroundClip = 'text';
    element.style.webkitTextFillColor = 'transparent';
    element.style.backgroundPosition = direction === 'left' ? '100% 0' : '0% 0';

    const shineAnimation = {
      backgroundPosition: direction === 'left' 
        ? ['200% 0', '-200% 0'] 
        : ['-200% 0', '200% 0'],
      transition: {
        duration: speed,
        repeat: yoyo ? -1 : Infinity,
        ease: 'linear',
        delay: delay,
      },
    };

    element.animate(
      [
        { backgroundPosition: direction === 'left' ? '200% 0' : '-200% 0' },
        { backgroundPosition: direction === 'left' ? '-200% 0' : '200% 0' },
      ],
      {
        duration: speed * 1000,
        iterations: Infinity,
        easing: 'linear',
        delay: delay * 1000,
      }
    );

    return () => {
      element.style.color = '';
      element.style.backgroundImage = '';
      element.style.backgroundSize = '';
      element.style.backgroundClip = '';
      element.style.webkitBackgroundClip = '';
      element.style.webkitTextFillColor = '';
      element.style.backgroundPosition = '';
    };
  }, [text, speed, delay, color, shineColor, spread, direction, yoyo, pauseOnHover, disabled]);

  return (
    <motion.span
      ref={textRef}
      className={`inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {text}
    </motion.span>
  );
}
