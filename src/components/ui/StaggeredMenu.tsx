import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

// ------------------------------------------
// Types
// ------------------------------------------
interface MenuItem {
  label: string;
  link: string;
  ariaLabel: string;
}

interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: MenuItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
}

// ------------------------------------------
// StaggeredMenu Component
// ------------------------------------------
export function StaggeredMenu({
  position = 'right',
  colors = ['#B19EEF', '#5227FF'],
  items = [],
  displayItemNumbering = true,
  menuButtonColor = '#ffffff',
  openMenuButtonColor = '#ffffff',
  accentColor = '#5227FF',
  isFixed = false,
  closeOnClickAway = true,
}: StaggeredMenuProps) {
  // Use refs for state that needs to be read synchronously
  const isOpenRef = useRef(false);
  const isAnimatingRef = useRef(false);
  
  // Use state only for UI updates (re-renders)
  const [isOpen, setIsOpen] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    if (isAnimatingRef.current || isOpenRef.current) return;
    
    isAnimatingRef.current = true;
    isOpenRef.current = true;
    setIsOpen(true);
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    // Animate overlay
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Animate panel
    const xFrom = position === 'right' ? '100%' : '-100%';
    tl.fromTo(
      panelRef.current,
      { x: xFrom } as gsap.TweenVars,
      { x: '0%', duration: 0.6, ease: 'power3.out' }
    );

    // Stagger menu items
    if (itemsRef.current.length > 0) {
      tl.fromTo(
        itemsRef.current,
        {
          opacity: 0,
          y: 40,
        } as gsap.TweenVars,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        },
        '-=0.3'
      );
    }
  }, [position]);

  const closeMenu = useCallback(() => {
    if (isAnimatingRef.current || !isOpenRef.current) return;
    
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        isOpenRef.current = false;
        setIsOpen(false);
        document.body.style.overflow = '';
      },
    });

    // Reverse stagger items
    if (itemsRef.current.length > 0) {
      tl.to(itemsRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.in',
      });
    }

    // Animate panel out
    const xTo = position === 'right' ? '100%' : '-100%';
    tl.to(panelRef.current, {
      x: xTo,
      duration: 0.5,
      ease: 'power3.in',
    });

    // Fade overlay
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    }, '-=0.4');
  }, [position]);

  const toggleMenu = useCallback(() => {
    if (isOpenRef.current) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [openMenu, closeMenu]);

  // Handle click outside
  useEffect(() => {
    if (!closeOnClickAway) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on the menu button or inside the panel
      if (menuBtnRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      
      // Only close if menu is open
      if (isOpenRef.current) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickAway, closeMenu]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenRef.current) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMenu]);

  const handleItemClick = (link: string) => {
    if (!isOpenRef.current) return;
    
    closeMenu();
    
    setTimeout(() => {
      if (link === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.querySelector(link);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 600);
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        ref={menuBtnRef}
        onClick={toggleMenu}
        className="fixed z-[60] right-6 top-8 p-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{
          background: 'rgba(0,0,0,0.4)',
        }}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <div className="relative w-10 h-10 overflow-hidden rounded-full">
          {/* Closed Pokeball */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Pokebola-pokeball-png-0.png"
            alt="Menu"
            className={`w-full h-full object-contain transition-all duration-300 ${
              isOpen ? 'opacity-0 scale-0 rotate-180' : 'opacity-100 scale-100 rotate-0'
            }`}
          />
          {/* Ultra Ball when open - from PokeAPI GitHub */}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
            alt="Menu"
            className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
              isOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-180'
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[55] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          opacity: isOpen ? 1 : 0,
        }}
      />

      {/* Menu Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 bottom-0 z-[58] w-full max-w-md transition-opacity duration-300 ${
          position === 'right' ? 'right-0' : 'left-0'
        } ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{
          x: position === 'right' ? '100%' : '-100%',
          opacity: isOpen ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 30, 50, 0.98))',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at ${position === 'right' ? 'top right' : 'top left'}, ${accentColor}40, transparent 60%)`,
          }}
        />

        <div className="relative h-full flex flex-col justify-center px-12">
          {/* Menu Items */}
          <nav className="space-y-4" role="navigation" aria-label="Main navigation">
            {items.map((item, index) => (
              <div
                key={item.label}
                ref={(el) => { itemsRef.current[index] = el; }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => handleItemClick(item.link)}
                  className="flex items-center gap-6 text-white/90 hover:text-white transition-colors duration-300 group cursor-pointer"
                  aria-label={item.ariaLabel}
                >
                  {displayItemNumbering && (
                    <span
                      className="text-sm font-mono font-bold opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: accentColor }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    {item.label}
                  </span>
                  <span className="text-2xl opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    →
                  </span>
                </button>
              </div>
            ))}
          </nav>

          {/* Decorative elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
}
