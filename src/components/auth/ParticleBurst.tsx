import { useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  opacity: number;
}

interface Props {
  active: boolean;
  origin?: "center" | "button";
}

/**
 * ParticleBurst — Explosive scatter of golden/white particles on success.
 * Each particle has independent physics: velocity, gravity, decay.
 */
export function ParticleBurst({ active, origin = "center" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const particles = useMemo<Particle[]>(() => {
    const r = () => Math.random();
    const colors = [
      "rgba(255, 230, 180, 1)",
      "rgba(255, 215, 140, 1)",
      "rgba(255, 255, 255, 1)",
      "rgba(200, 195, 255, 1)",
      "rgba(255, 200, 220, 1)",
    ];
    return Array.from({ length: 40 }, (_, i) => {
      const angle = r() * Math.PI * 2;
      const speed = 80 + r() * 220;
      return {
        id: i,
        x: origin === "center" ? 50 : 50,
        y: origin === "center" ? 50 : 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 2 + r() * 4,
        color: colors[Math.floor(r() * colors.length)],
        delay: r() * 0.08,
        duration: 0.6 + r() * 0.8,
        opacity: 0.6 + r() * 0.4,
      };
    });
    // `active` is intentional: it is not read inside the factory, but each
    // re-trigger must produce a fresh random burst rather than replaying the
    // previous particle set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, origin]);

  return (
    <AnimatePresence>
      {active && (
        <div
          ref={containerRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ borderRadius: "28px" }}
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                scale: 0,
                opacity: p.opacity,
              }}
              animate={{
                left: `${p.x + p.vx / 6}%`,
                top: `${p.y + p.vy / 6}%`,
                scale: [0, 1, 1, 0],
                opacity: [p.opacity, p.opacity, 0.4, 0],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.22, 0.8, 0.36, 1],
              }}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}`,
                filter: "blur(0.5px)",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
