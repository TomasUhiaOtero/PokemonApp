import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
}

export function SplitText({
  text,
  className = '',
  delay = 0,
  duration = 0.8,
  ease = 'bounce.out',
  splitType = 'chars',
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.split-char, .split-word');
    
    gsap.fromTo(
      chars,
      {
        y: 100,
        opacity: 0,
        rotateX: -90,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: duration,
        delay: delay,
        ease: ease,
        stagger: splitType === 'chars' ? 0.03 : 0.1,
      }
    );
  }, [text, delay, duration, ease, splitType]);

  // Render initial HTML
  const words = text.split(' ');
  
  if (splitType === 'chars') {
    return (
      <div ref={containerRef} className={`${className} perspective-1000`}>
        <h1 className="inline-flex flex-wrap justify-center">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex overflow-hidden">
              {word.split('').map((char, charIndex) => (
                <span
                  key={charIndex}
                  className="split-char inline-block"
                  style={{ display: 'inline-block' }}
                >
                  {char}
                </span>
              ))}
              {wordIndex < words.length - 1 && <span className="split-char inline-block">&nbsp;</span>}
            </span>
          ))}
        </h1>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`${className} perspective-1000`}>
      <h1 className="inline-flex flex-wrap justify-center">
        {words.map((word, index) => (
          <span
            key={index}
            className="split-word inline-block mr-2 overflow-hidden"
          >
            {word}
          </span>
        ))}
      </h1>
    </div>
  );
}
