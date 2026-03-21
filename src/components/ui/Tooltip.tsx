import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ------------------------------------------
// Tooltip Component (Animate UI Style)
// ------------------------------------------
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  delay?: number;
}

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 10,
  delay = 0,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

  const handleMouseEnter = () => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
    } else {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  };

  const getPosition = () => {
    switch (side) {
      case "top":
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: `${sideOffset}px`,
        };
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: `${sideOffset}px`,
        };
      case "left":
        return {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: `${sideOffset}px`,
        };
      case "right":
        return {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: `${sideOffset}px`,
        };
      default:
        return {};
    }
  };

  const getArrowPosition = () => {
    switch (side) {
      case "top":
        return {
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
        };
      case "bottom":
        return {
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
        };
      case "left":
        return {
          right: "-6px",
          top: "50%",
          transform: "translateY(-50%) rotate(45deg)",
        };
      case "right":
        return {
          left: "-6px",
          top: "50%",
          transform: "translateY(-50%) rotate(45deg)",
        };
      default:
        return {};
    }
  };

  const variants = {
    initial: {
      opacity: 0,
      scale: 0.96,
      ...(side === "top" && { y: 4 }),
      ...(side === "bottom" && { y: -4 }),
      ...(side === "left" && { x: 4 }),
      ...(side === "right" && { x: -4 }),
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 35,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.15,
      },
      ...(side === "top" && { y: 4 }),
      ...(side === "bottom" && { y: -4 }),
      ...(side === "left" && { x: 4 }),
      ...(side === "right" && { x: -4 }),
    },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute z-50 pointer-events-none"
            style={getPosition()}
            role="tooltip"
          >
            <div
              className="px-3 py-2 text-sm font-medium text-white bg-zinc-900/95 backdrop-blur-xl 
                         rounded-xl shadow-2xl border border-white/10 whitespace-nowrap
                         dark:bg-zinc-900/95 dark:text-white"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {content}
              {/* Arrow */}
              <div
                className="absolute w-3 h-3 bg-zinc-900/95 border-inherit"
                style={{
                  ...getArrowPosition(),
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  clipPath: "polygon(0 0, 100% 100%, 0 100%)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
