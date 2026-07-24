import { motion, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";
import { ease } from "@/lib/motion";
import { MemoryQuote } from "./MemoryQuote";

/**
 * Compressed memory scene for mobile/tablet — pinned to the top of the viewport,
 * so the login slab can rise from beneath it.
 */
export function MobileMemoryHero() {
  const reduced = useReducedMotion();
  const hero = { id: "interstellar", title: "Interstellar", rating: 4.8, poster: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)" };
  const second = { id: "one-piece", title: "One Piece", rating: 4.9, poster: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)" };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[48vh] overflow-hidden lg:hidden"
    >
      {/* atmospheric wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, oklch(0.32 0.09 270 / 0.55), transparent 75%), radial-gradient(40% 40% at 80% 20%, oklch(0.7 0.18 320 / 0.18), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* secondary distant poster */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 0.38, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: ease.out }}
        className="absolute left-[6%] top-[14%] aspect-[2/3] w-[96px] -rotate-[7deg] overflow-hidden rounded-[10px] ring-1 ring-white/10 shadow-[0_24px_56px_-24px_oklch(0_0_0/0.85)]"
        style={{ filter: "blur(2.5px)" }}
      >
        <img src={second.poster} alt="" className="h-full w-full object-cover" />
      </motion.div>

      {/* hero poster */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{ opacity: 0.92, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: ease.out }}
        className="absolute right-[8%] top-[10%] aspect-[2/3] w-[148px] rotate-[4deg] overflow-hidden rounded-[14px] ring-1 ring-white/15 shadow-[0_30px_70px_-26px_oklch(0_0_0/0.9)]"
      >
        <img src={hero.poster} alt="" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, oklch(0.10 0.02 270 / 0.65))",
          }}
        />
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9px] text-white/75">
          <span className="truncate font-display italic">{hero.title}</span>
          {typeof hero.rating === "number" && (
            <span className="flex items-center gap-0.5 text-amber-200/85">
              <Star className="h-2.5 w-2.5 fill-amber-200/85" />
              {hero.rating.toFixed(1)}
            </span>
          )}
        </div>
      </motion.div>

      {/* ticket artifact */}
      <motion.div
        initial={{ opacity: 0, y: 10, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -9 }}
        transition={{ duration: 1.0, delay: 0.55, ease: ease.out }}
        className="absolute left-[10%] bottom-[18%] w-[90px] rotate-[-9deg] overflow-hidden rounded-md bg-[oklch(0.92_0.02_75)] text-[oklch(0.22_0.04_60)] shadow-[0_22px_44px_-18px_oklch(0_0_0/0.85)]"
      >
        <div className="px-2 py-1.5">
          <div className="font-display text-[11px] leading-tight">IMAX · DUNE</div>
          <div className="text-[7px] tracking-wider text-[oklch(0.4_0.04_60)]">Row G · 23</div>
        </div>
        <div className="relative h-px bg-[oklch(0.7_0.03_60_/_0.5)]">
          <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[oklch(0.12_0.02_270)]" />
          <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[oklch(0.12_0.02_270)]" />
        </div>
        <div className="px-2 py-0.5 text-[7px] tracking-[0.22em] text-[oklch(0.5_0.04_60)]">
          ADMIT ONE
        </div>
      </motion.div>

      {/* quote, pinned over bottom of hero band */}
      <div className="pointer-events-auto absolute inset-x-5 bottom-3">
        <MemoryQuote />
      </div>

      {/* fade into card */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent, oklch(0.08 0.02 270 / 0.95))",
        }}
      />
      {/* film grain (very subtle on mobile) */}
      {!reduced && (
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />
      )}
    </div>
  );
}
