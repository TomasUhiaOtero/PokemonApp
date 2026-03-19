import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ------------------------------------------
// Types
// ------------------------------------------
interface NavItem {
  title: string;
  hoverColor: string;
}

interface FluidNavigationProps {
  items?: NavItem[];
  onNavigate?: (index: number) => void;
}

// ------------------------------------------
// SVG Icons
// ------------------------------------------
const HomeIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const CalendarIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2" />
  </svg>
);

const HelpIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" />
  </svg>
);

// Pokeball SVG
const PokeballIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 2C6.47715 2 2 6.47715 2 12" fill="#ef4444" stroke="none" />
    <path d="M12 22C17.5228 22 22 17.5228 22 12" fill="#f8fafc" stroke="none" />
    <rect x="2" y="11" width="20" height="2" fill={color} />
    <circle cx="12" cy="12" r="3" fill="#f8fafc" stroke={color} strokeWidth="1.5" />
  </svg>
);

// ------------------------------------------
// Default Items
// ------------------------------------------
const DEFAULT_ITEMS: NavItem[] = [
  { title: "Inicio", hoverColor: "#036aef" },
  { title: "Pokemons", hoverColor: "#d92343" },
  { title: "About", hoverColor: "#0ac423" },
];

// ------------------------------------------
// FluidNavigation Component
// ------------------------------------------
export function FluidNavigation({ 
  items = DEFAULT_ITEMS, 
  onNavigate 
}: FluidNavigationProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    // Activar flash de color
    setFlashingIndex(index);
    
    // Quitar el flash después de la animación
    setTimeout(() => {
      setFlashingIndex(null);
    }, 400);

    onNavigate?.(index);

    // Scroll to section
    const targetId = items[index].title.toLowerCase();
    if (targetId === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(index);
    }
  };

  // Determine which index to highlight (hover takes priority over active)
  const highlightedIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  // Get the icon for each item
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <HomeIcon size={22} />;
      case 1:
        return <PokeballIcon size={26} />;
      case 2:
        return <HelpIcon size={22} />;
      default:
        return null;
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 32,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      {/* Glass Tray - estilo iOS Dock */}
      <motion.div
        layout
        transition={{
          layout: { type: "spring", mass: 0.1, stiffness: 150, damping: 12 },
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "14px 32px",
          borderRadius: 40,
          // Glass gradient como el PokemonDock
          background: "linear-gradient(160deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.10) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
          boxShadow: [
            "0 0 0 0.5px rgba(0, 0, 0, 0.1)",
            "0 8px 32px rgba(0, 0, 0, 0.25)",
            "0 2px 8px rgba(0, 0, 0, 0.15)",
            "inset 0 1.5px 0 rgba(255, 255, 255, 0.4)",
            "inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          ].join(", "),
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Top highlight gradient */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 40,
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.00) 60%)",
            pointerEvents: "none",
          }}
        />
        {items.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isHighlighted = highlightedIndex === index;
          const isFlashing = flashingIndex === index;
          const showTooltip = isHovered;

          return (
            // Contenedor que agrupa botón + tooltip
            <div key={item.title} className="relative flex items-center">
              {/* Botón */}
              <motion.div
                layout
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={0}
                role="button"
                aria-label={item.title}
                data-framer-name={index === 0 ? "1" : index === 1 ? "2" : "3"}
                transition={{
                  layout: { type: "spring", bounce: 0, stiffness: 150, damping: 15 },
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={
                  isFlashing
                    ? {
                        background: item.hoverColor,
                        boxShadow: `0 0 30px ${item.hoverColor}cc, 0 0 60px ${item.hoverColor}80, inset 0 0 20px ${item.hoverColor}40`,
                      }
                    : {
                        background: "rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }
                }
                style={{
                  cursor: "pointer",
                  zIndex: 2,
                  padding: "12px 18px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Glass effect - siempre igual
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  transition: "background 0.15s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Icon */}
                <motion.div
                  style={{
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  animate={{
                    scale: isHighlighted ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {getIcon(index)}
                </motion.div>
              </motion.div>

              {/* Tooltip/Name - aparece FUERA del botón, a la derecha */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      left: "100%",
                      marginLeft: "12px",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      style={{
                        padding: "10px 16px",
                        background: "rgba(15, 23, 42, 0.95)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: "#ffffff",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {item.title}
                      {/* Flechita */}
                      <div
                        style={{
                          position: "absolute",
                          right: "100%",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 0,
                          height: 0,
                          borderTop: "6px solid transparent",
                          borderBottom: "6px solid transparent",
                          borderRight: "8px solid rgba(15, 23, 42, 0.95)",
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </motion.nav>
  );
}
