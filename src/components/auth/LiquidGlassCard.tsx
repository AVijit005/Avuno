import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function LiquidGlassCard({ children, className = "" }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 80, damping: 20, mass: 0.3 });
  const smy = useSpring(my, { stiffness: 80, damping: 20, mass: 0.3 });

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 55, damping: 16, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 55, damping: 16, mass: 0.5 });

  const updatePointer = useCallback(
    (e: PointerEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const cx = Math.max(0, Math.min(1, nx));
      const cy = Math.max(0, Math.min(1, ny));
      mx.set(cx);
      my.set(cy);
      ry.set((cx - 0.5) * 14);
      rx.set(-(cy - 0.5) * 9);
    },
    [mx, my, rx, ry],
  );

  const resetTilt = useCallback(() => {
    rx.set(0);
    ry.set(0);
    mx.set(0.5);
    my.set(0.5);
  }, [rx, ry, mx, my]);

  useEffect(() => {
    if (reduced) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const el = cardRef.current;
    if (!el) return;

    const unsubX = smx.on("change", (v) => el.style.setProperty("--lg-x", String(v)));
    const unsubY = smy.on("change", (v) => el.style.setProperty("--lg-y", String(v)));
    el.addEventListener("pointermove", updatePointer);
    el.addEventListener("pointerleave", resetTilt);
    return () => {
      unsubX();
      unsubY();
      el.removeEventListener("pointermove", updatePointer);
      el.removeEventListener("pointerleave", resetTilt);
    };
  }, [updatePointer, resetTilt, smx, smy, reduced]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 36, filter: "blur(22px)", scale: 0.96 }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      transition={{ duration: 1.15, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--lg-x": 0.5,
          "--lg-y": 0.5,
          background:
            "linear-gradient(145deg, rgba(16, 14, 26, 0.62) 0%, rgba(22, 20, 40, 0.42) 100%)",
          backdropFilter: "blur(44px) saturate(170%) brightness(1.06)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 60px 130px -24px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.2)",
          borderRadius: "32px",
          rotateX: reduced ? 0 : srx,
          rotateY: reduced ? 0 : sry,
          transformPerspective: 1400,
        } as React.CSSProperties
      }
    >
      {/* LIQUID SHEEN */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.7,
            background:
              "linear-gradient(120deg, transparent 0%, rgba(155,140,255,0.20) 28%, transparent 52%, rgba(255,175,205,0.13) 76%, transparent 100%)",
            backgroundSize: "230% 230%",
            backgroundPosition: "calc(var(--lg-x) * 100%) calc(var(--lg-y) * 100%)",
            transition: "background-position 0.05s linear",
          }}
        />
      )}

      {/* FRESNEL EDGE */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: "32px",
            padding: "1px",
            background:
              "radial-gradient(520px 520px at calc(var(--lg-x) * 100%) calc(var(--lg-y) * 100%), rgba(210,200,255,0.60) 0%, rgba(255,185,215,0.32) 35%, transparent 68%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            mixBlendMode: "screen",
            opacity: 0.65,
          }}
        />
      )}

      {/* CAUSTIC REFRACTION BLOB */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute h-80 w-80 rounded-full"
          style={{
            left: "calc(var(--lg-x) * 100% - 10rem)",
            top: "calc(var(--lg-y) * 100% - 10rem)",
            background:
              "radial-gradient(circle, rgba(175,165,255,0.20) 0%, rgba(255,185,215,0.11) 42%, transparent 70%)",
            mixBlendMode: "screen",
            filter: "blur(30px)",
            opacity: 0.6,
            transition: "left 0.06s linear, top 0.06s linear",
          }}
        />
      )}

      {/* STATIC GRADIENT BORDER — subtle, no rotation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      />

      {/* TOP HAIRLINE */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.50) 50%, transparent 92%)",
        }}
      />

      {/* INNER AMBIENT GLOW — breathes */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-60 w-80 -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(160,150,255,0.12) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* FILM GRAIN */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
