import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { Heart, Bookmark, Ticket, Music2, Star, Award, Calendar } from "lucide-react";
import { useMouseParallax } from "@/lib/useParallax";
import { useTimeOfDay } from "@/lib/useTimeOfDay";
import { dur, ease } from "@/lib/motion";
import { MemoryQuote } from "./MemoryQuote";
import { MemoryStats } from "./MemoryStats";

/* --------------------------------------------------------------
 * Chronicle Auth 4.0 — Cinematic Memory Universe
 * Five visual layers, hand-curated composition, memory artifacts.
 * -------------------------------------------------------------- */

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/* --------- Hand-curated composition ---------
 * Coordinates are intentional — not procedural — to feel arranged.
 * Left panel is ~55% of viewport width. We work in a 0–100 % box.
 * Right column (x > 56%) is reserved for headline + stats. */

type PosterPlacement = {
  id: string;
  x: number; // %
  y: number; // %
  w: number; // px
  rot: number; // deg
  layer: 1 | 2 | 3 | 4; // 1 far-blurred, 2 distant, 3 main, 4 foreground
};

// Mix kinds for visual storytelling.
const POSTERS: PosterPlacement[] = [
  // Layer 2 — distant, blurred memories
  { id: "succession", x: 6, y: 14, w: 110, rot: -8, layer: 2 },
  { id: "harry-potter", x: 50, y: 8, w: 130, rot: 6, layer: 2 },
  { id: "dark-side", x: 16, y: 78, w: 120, rot: -5, layer: 2 },
  { id: "lex", x: 44, y: 88, w: 100, rot: 4, layer: 2 },
  { id: "mkbhd", x: 2, y: 48, w: 95, rot: -10, layer: 2 },
  { id: "chainsaw-man", x: 54, y: 60, w: 115, rot: 8, layer: 2 },

  // Layer 3 — main hero memories (large, sharp, anchored)
  { id: "interstellar", x: 36, y: 22, w: 220, rot: 3, layer: 3 },
  { id: "one-piece", x: 20, y: 26, w: 200, rot: -4, layer: 3 },
  { id: "elden-ring", x: 52, y: 48, w: 175, rot: 6, layer: 3 },
  { id: "dune", x: 42, y: 78, w: 150, rot: -7, layer: 3 },

  // Layer 4 — foreground, slightly bleeding off-canvas
  { id: "cyberpunk", x: 30, y: 80, w: 130, rot: -3, layer: 4 },
];

type Artifact =
  | { kind: "quote"; x: number; y: number; rot: number; text: string; attrib: string }
  | { kind: "journal"; x: number; y: number; rot: number; time: string; text: string }
  | { kind: "ticket"; x: number; y: number; rot: number; title: string; seat: string; date: string }
  | { kind: "waveform"; x: number; y: number; rot: number; title: string; sub: string }
  | { kind: "progress"; x: number; y: number; rot: number; title: string; pct: number }
  | { kind: "badge"; x: number; y: number; rot: number; label: string; year: string }
  | { kind: "datelabel"; x: number; y: number; rot: number; text: string }
  | { kind: "rating"; x: number; y: number; rot: number; title: string; rating: number }
  | { kind: "favorite"; x: number; y: number; rot: number; label: string };

const ARTIFACTS: Artifact[] = [
  {
    kind: "quote",
    x: 44,
    y: 18,
    rot: 5,
    text: "Worth\nwatching\nagain.",
    attrib: "♥",
  },
  {
    kind: "journal",
    x: 30,
    y: 70,
    rot: -2,
    time: "02:17 AM",
    text: "Stories make us\nfeel less alone.\n— A. V.",
  },
  {
    kind: "ticket",
    x: 3,
    y: 76,
    rot: -9,
    title: "IMAX · DUNE",
    seat: "Row G  ·  Seat 23",
    date: "12 / 02 / 23",
  },
  {
    kind: "waveform",
    x: 52,
    y: 32,
    rot: -3,
    title: "Cornfield Chase",
    sub: "Hans Zimmer · 4:36",
  },
  {
    kind: "progress",
    x: 52,
    y: 76,
    rot: 4,
    title: "Reading Progress",
    pct: 72,
  },
  {
    kind: "badge",
    x: 12,
    y: 32,
    rot: -6,
    label: "First Memory",
    year: "Spring 2022",
  },
  { kind: "datelabel", x: 26, y: 6, rot: -4, text: "Yesterday · ★★★★★" },
  { kind: "datelabel", x: 40, y: 60, rot: 7, text: "Two months ago" },
  { kind: "rating", x: 22, y: 44, rot: 2, title: "Spirited Away", rating: 5 },
  { kind: "favorite", x: 48, y: 52, rot: -2, label: "Favorite of 2024" },
];

/* --------------------------------------------------------------- */

export function AuthStage() {
  const reduced = useReducedMotion();
  const { x: mx, y: my } = useMouseParallax(6);
  const tod = useTimeOfDay();

  // Stable particle field
  const particles = useMemo(() => {
    const r = rand(7);
    return Array.from({ length: 26 }, (_, i) => ({
      x: r() * 100,
      y: r() * 100,
      s: 1 + r() * 2.4,
      d: 8 + r() * 14,
      o: 0.18 + r() * 0.35,
      delay: r() * 8,
      key: i,
    }));
  }, []);

  const todTint =
    tod === "morning"
      ? "oklch(0.78 0.12 70 / 0.10)"
      : tod === "afternoon"
        ? "oklch(0.7 0.1 250 / 0.08)"
        : tod === "evening"
          ? "oklch(0.7 0.18 35 / 0.11)"
          : "oklch(0.55 0.2 270 / 0.12)";

  // Layer drift configs (1 = farthest, slowest, smallest shift)
  const layerDrift = [
    { range: 4, period: 36, parallax: 0.18 },
    { range: 6, period: 30, parallax: 0.32 },
    { range: 8, period: 24, parallax: 0.55 },
    { range: 10, period: 20, parallax: 0.9 },
  ];

  return (
    <div className="relative hidden h-full overflow-hidden lg:block">
      {/* ============ LAYER 1 — far atmosphere ============ */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* deep blurred memory wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 28% 38%, oklch(0.32 0.07 270 / 0.55), transparent 70%), radial-gradient(50% 40% at 18% 80%, oklch(0.28 0.09 300 / 0.45), transparent 75%)",
            filter: "blur(40px)",
          }}
        />
        {/* light leak */}
        <div
          className="absolute -top-24 right-[20%] h-[55%] w-[55%] -rotate-12"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.92 0.1 240 / 0.18), transparent 70%)",
            mixBlendMode: "screen",
            filter: "blur(20px)",
          }}
        />
        {/* time-of-day wash */}
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{
            background: `radial-gradient(80% 60% at 50% 0%, ${todTint}, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* ============ LAYER 2–4 — Memory composition ============ */}
      {[2, 3, 4].map((layerNum) => {
        const drift = layerDrift[layerNum - 1];
        const items = POSTERS.filter((p) => p.layer === layerNum);
        const artifactsHere =
          layerNum === 3 ? ARTIFACTS.slice(0, 6) : layerNum === 4 ? ARTIFACTS.slice(6) : [];

        return (
          <motion.div
            key={layerNum}
            aria-hidden
            className="absolute inset-0"
            style={{
              willChange: "transform",
              x: reduced ? 0 : (mx as never),
              y: reduced ? 0 : (my as never),
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={
                reduced
                  ? undefined
                  : { translateY: [0, -drift.range, 0, drift.range, 0] }
              }
              transition={
                reduced
                  ? undefined
                  : {
                      duration: drift.period,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }
              }
            >
              {items.map((p, i) => {
                const MOCK_POSTERS: Record<string, string> = {
                  "succession": "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
                  "harry-potter": "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)",
                  "dark-side": "https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe",
                  "lex": "https://i.scdn.co/image/ab6765630000ba8aa3b02ce859ce87391807d919",
                  "mkbhd": "https://yt3.googleusercontent.com/ytc/AIdro_m_LwQ6ZpWbE2O5zZ_Yt3o4yP5a0O_L7V9mF6wK7w=s900-c-k-c0x00ffffff-no-rj",
                  "chainsaw-man": "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
                  "interstellar": "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
                  "one-piece": "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)",
                  "elden-ring": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                  "dune": "linear-gradient(135deg, #2d1b2e 0%, #4a1942 50%, #7b2d5c 100%)",
                  "cyberpunk": "linear-gradient(135deg, #1e2a1e 0%, #2d4a2d 50%, #3d7a3d 100%)"
                };
                const media = {
                  title: p.id,
                  poster: MOCK_POSTERS[p.id] || "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
                  rating: 5
                };
                const blur =
                  layerNum === 2 ? 4 : layerNum === 3 ? 0 : 0;
                const opacity =
                  layerNum === 2 ? 0.42 : layerNum === 3 ? 0.95 : 0.92;
                return (
                  <motion.div
                    key={`${layerNum}-${p.id}-${i}`}
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity, y: 0, scale: 1 }}
                    transition={{
                      duration: 1.1,
                      ease: ease.out,
                      delay: 0.15 + (layerNum - 2) * 0.18 + i * 0.06,
                    }}
                    whileHover={
                      reduced
                        ? undefined
                        : {
                            y: -3,
                            rotate: p.rot + (p.rot >= 0 ? 0.6 : -0.6),
                            transition: { duration: dur.large, ease: ease.out },
                          }
                    }
                    style={{
                      position: "absolute",
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.w}px`,
                      transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
                      filter: blur ? `blur(${blur}px)` : undefined,
                    }}
                    className="aspect-[2/3] overflow-hidden rounded-[14px] ring-1 ring-white/10 shadow-[0_30px_70px_-30px_oklch(0_0_0/0.85),inset_0_1px_0_oklch(1_0_0/0.06)]"
                  >
                    <img
                      src={media.poster}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {/* Cinematic dim & vignette per poster */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, oklch(0 0 0 / 0) 35%, oklch(0.10 0.02 270 / 0.65)), radial-gradient(140% 80% at 50% 0%, oklch(1 0 0 / 0.06), transparent 60%)",
                      }}
                    />
                    {/* Tiny title chip — only on layer 3 main hero memories */}
                    {layerNum === 3 && (
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[9px] text-white/70">
                        <span className="truncate font-display italic tracking-wide">
                          {media.title}
                        </span>
                        {typeof (media.rating ?? 0) === "number" && (
                          <span className="flex items-center gap-0.5 text-[8px] text-amber-200/80">
                            <Star className="h-2.5 w-2.5 fill-amber-200/80" />
                            {(media.rating ?? 0).toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Memory artifacts on this layer */}
              {artifactsHere.map((a, i) => (
                <ArtifactCard
                  key={`a-${layerNum}-${i}`}
                  artifact={a}
                  delay={0.5 + (layerNum - 3) * 0.15 + i * 0.07}
                />
              ))}
            </motion.div>
          </motion.div>
        );
      })}

      {/* ============ LAYER 5 — particle dust ============ */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {particles.map((p) => (
            <motion.span
              key={p.key}
              className="absolute rounded-full bg-white"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s,
                height: p.s,
                opacity: p.o,
                filter: "blur(0.5px)",
                boxShadow: "0 0 6px oklch(0.85 0.1 240 / 0.4)",
              }}
              animate={{
                y: [0, -18, 0, 14, 0],
                opacity: [p.o * 0.5, p.o, p.o * 0.4, p.o, p.o * 0.5],
              }}
              transition={{
                duration: p.d,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* ============ Atmosphere overlays (lighting) ============ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 22% 36%, oklch(0.9 0.12 250 / 0.18), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      {/* warm fill from below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 30% at 30% 100%, oklch(0.75 0.16 35 / 0.10), transparent 65%)",
          mixBlendMode: "screen",
        }}
      />
      {/* deep vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 35% 50%, transparent 38%, oklch(0.08 0.02 270 / 0.78) 92%)",
        }}
      />
      {/* right-edge fade — soft, lets the canvas bleed under the floating slab */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[28%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.09 0.02 270 / 0.55))",
        }}
      />

      {/* CINEMATIC BOTTOM FADE — natural darkness for text legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,3,15,0.92) 0%, rgba(5,3,15,0.65) 18%, rgba(5,3,15,0.30) 36%, transparent 55%)",
        }}
      />

      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* ============ Hero column ============ */}
      <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: ease.out }}
          className="flex items-center gap-4"
        >
          {/* ── Logo icon ── */}
          <div className="relative h-12 w-12 flex-shrink-0">
            {/* Subtle ambient glow — barely visible, cinematic */}
            <motion.div
              aria-hidden
              className="absolute -inset-2 rounded-3xl"
              animate={{ opacity: [0.28, 0.52, 0.28] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.60 0.26 272 / 0.65) 0%, transparent 72%)",
                filter: "blur(10px)",
              }}
            />

            {/* Icon body */}
            <motion.div
              className="relative h-12 w-12 grid place-items-center rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.58 0.26 292), oklch(0.48 0.28 255), oklch(0.55 0.24 218))",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.13), 0 10px 28px -8px oklch(0.58 0.26 268 / 0.55)",
              }}
              animate={{
                filter: [
                  "hue-rotate(0deg)",
                  "hue-rotate(20deg)",
                  "hue-rotate(0deg)",
                ],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Glass top-left reflection */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)",
                }}
              />
              <span className="font-display text-[22px] font-bold text-white leading-none z-10"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}>
                C
              </span>
            </motion.div>
          </div>

          {/* ── Wordmark ── */}
          <div className="flex flex-col leading-none">
            {/* Staggered letter entrance — one-shot */}
            <motion.span
              className="font-display text-2xl font-semibold tracking-tight text-white"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.038, delayChildren: 0.15 },
                },
              }}
            >
              {"Chronicle".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 7, filter: "blur(4px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.span>

            <motion.span
              className="mt-[5px] text-[9px] uppercase tracking-[0.36em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ duration: 1, delay: 0.65 }}
              style={{ color: "oklch(0.70 0.10 268)" }}
            >
              Your memory portal
            </motion.span>
          </div>
        </motion.div>

        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: ease.out }}
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.36em] text-primary/90"
          >
            <span className="h-px w-6 bg-primary/50" />
            The portal
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.6, ease: ease.out }}
            className="mt-7 text-balance font-display text-[3.4rem] leading-[1.02] tracking-tight xl:text-[4.1rem]"
            style={{
              filter:
                "drop-shadow(0 4px 32px rgba(0,0,0,1)) drop-shadow(0 1px 6px rgba(0,0,0,0.95))",
            }}
          >
            <span className="text-gradient-aurora">Every story you finish</span>
            <br />
            <span
              className="italic"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              becomes part of{" "}
              <span
                style={{
                  fontStyle: "normal",
                  fontWeight: 700,
                  color: "#ffffff",
                  filter: "drop-shadow(0 0 18px oklch(0.72 0.22 268 / 0.75))",
                }}
              >
                your story.
              </span>
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, delay: 1.0, ease: ease.out }}
            className="mt-8 h-px w-16 origin-left bg-gradient-to-r from-primary/60 to-transparent"
          />

          <MemoryQuote className="mt-7" />

          <MemoryStats className="mt-10" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.9, delay: 1.4, ease: ease.out }}
          className="flex items-center gap-2 text-[11px] text-muted-foreground"
        >
          <Heart className="h-3 w-3 fill-primary/60 text-primary/60" />
          <span className="tracking-wide">
            Your memories. Your way. <span className="italic text-foreground/70">Forever.</span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ================== Memory artifact cards ================== */

function ArtifactCard({ artifact, delay }: { artifact: Artifact; delay: number }) {
  const reduced = useReducedMotion();
  const wrap = (children: React.ReactNode, extra = "") => (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.95, ease: ease.out, delay }}
      whileHover={reduced ? undefined : { y: -2, rotate: artifact.rot * 0.6 }}
      style={{
        position: "absolute",
        left: `${artifact.x}%`,
        top: `${artifact.y}%`,
        transform: `translate(-50%, -50%) rotate(${artifact.rot}deg)`,
      }}
      className={`pointer-events-auto ${extra}`}
    >
      {children}
    </motion.div>
  );

  switch (artifact.kind) {
    case "quote":
      return wrap(
        <div
          className="relative w-[112px] rounded-[10px] bg-[oklch(0.94_0.02_85)] p-3 text-[11px] leading-snug text-[oklch(0.22_0.04_60)] shadow-[0_18px_40px_-18px_oklch(0_0_0/0.75),inset_0_1px_0_oklch(1_0_0/0.5)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, oklch(0.96 0.02 80 / 1), oklch(0.9 0.03 80 / 1))",
          }}
        >
          <div className="whitespace-pre-line font-display italic">{artifact.text}</div>
          <div className="mt-1.5 text-right text-rose-500/80">{artifact.attrib}</div>
          {/* folded corner */}
          <div
            aria-hidden
            className="absolute right-0 top-0 h-3 w-3"
            style={{
              background:
                "linear-gradient(225deg, oklch(0.78 0.03 80) 50%, transparent 50%)",
            }}
          />
        </div>,
      );

    case "journal":
      return wrap(
        <div className="relative w-[150px] rounded-[8px] bg-[oklch(0.93_0.025_85)] p-3 text-[10px] text-[oklch(0.25_0.04_60)] shadow-[0_22px_44px_-18px_oklch(0_0_0/0.8)]">
          <div className="text-[8px] uppercase tracking-[0.18em] text-[oklch(0.45_0.05_60)]">
            Late night thoughts · {artifact.time}
          </div>
          <div
            className="mt-1.5 whitespace-pre-line font-display italic leading-snug"
            style={{ fontFamily: '"Caveat", "Instrument Serif", cursive' }}
          >
            {artifact.text}
          </div>
          {/* underline pencil mark */}
          <div className="mt-1 h-px w-2/3 bg-[oklch(0.45_0.05_60_/_0.4)]" />
          {/* ribbon */}
          <div
            aria-hidden
            className="absolute -top-1 right-3 h-5 w-1.5 rounded-b"
            style={{ background: "oklch(0.55 0.18 25)" }}
          />
        </div>,
      );

    case "ticket":
      return wrap(
        <div className="relative w-[96px] overflow-hidden rounded-md bg-[oklch(0.92_0.02_75)] text-[oklch(0.22_0.04_60)] shadow-[0_18px_40px_-16px_oklch(0_0_0/0.8)]">
          <div className="px-2.5 py-2">
            <div className="font-display text-[12px] leading-tight tracking-tight">
              {artifact.title}
            </div>
            <div className="mt-1 text-[8px] tracking-wider text-[oklch(0.4_0.04_60)]">
              {artifact.seat}
            </div>
            <div className="mt-0.5 text-[8px] tracking-wider text-[oklch(0.4_0.04_60)]">
              {artifact.date}
            </div>
          </div>
          {/* perforation */}
          <div className="relative h-px bg-[oklch(0.7_0.03_60_/_0.5)]">
            <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[oklch(0.12_0.02_270)]" />
            <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[oklch(0.12_0.02_270)]" />
          </div>
          <div className="px-2.5 py-1 text-[8px] tracking-[0.2em] text-[oklch(0.5_0.04_60)]">
            ADMIT ONE
          </div>
        </div>,
      );

    case "waveform":
      return wrap(
        <div className="relative w-[140px] rounded-xl border border-white/10 bg-[oklch(0.18_0.02_270_/_0.85)] p-2.5 shadow-[0_18px_40px_-16px_oklch(0_0_0/0.8),inset_0_1px_0_oklch(1_0_0/0.06)] backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Music2 className="h-2.5 w-2.5 text-primary/80" />
            <span className="text-[9px] font-medium text-foreground/90">
              {artifact.title}
            </span>
          </div>
          {/* fake waveform */}
          <div className="mt-1.5 flex h-7 items-end gap-[2px]">
            {Array.from({ length: 28 }).map((_, i) => {
              const h = 20 + Math.sin(i * 0.7) * 50 + (i % 3) * 12;
              return (
                <span
                  key={i}
                  className="block w-[2px] rounded-full"
                  style={{
                    height: `${Math.max(8, Math.min(100, h))}%`,
                    background:
                      i < 16
                        ? "var(--primary)"
                        : "oklch(0.72 0.18 255 / 0.3)",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex items-center justify-between text-[8px] text-muted-foreground">
            <span>{artifact.sub}</span>
            <span>4:36</span>
          </div>
        </div>,
      );

    case "progress":
      return wrap(
        <div className="w-[130px] rounded-xl border border-white/10 bg-[oklch(0.18_0.02_270_/_0.85)] p-2.5 shadow-[0_18px_40px_-16px_oklch(0_0_0/0.8)] backdrop-blur-md">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-foreground/85">{artifact.title}</span>
            <span className="font-display text-foreground">{artifact.pct}%</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${artifact.pct}%`,
                background:
                  "linear-gradient(90deg, var(--primary), var(--primary))",
                boxShadow: "0 0 12px var(--primary)",
              }}
            />
          </div>
        </div>,
      );

    case "badge":
      return wrap(
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[oklch(0.18_0.02_270_/_0.85)] px-2.5 py-1.5 text-[9px] text-foreground/85 shadow-[0_14px_32px_-14px_oklch(0_0_0/0.8)] backdrop-blur-md">
          <Award className="h-3 w-3 text-amber-300/90" />
          <span>{artifact.label}</span>
          <span className="text-muted-foreground">· {artifact.year}</span>
        </div>,
      );

    case "datelabel":
      return wrap(
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[9px] tracking-wide text-foreground/75 ring-1 ring-white/10 backdrop-blur-md">
          <Calendar className="h-2.5 w-2.5 text-primary/80" />
          {artifact.text}
        </div>,
      );

    case "rating":
      return wrap(
        <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] text-foreground/85 ring-1 ring-white/10 backdrop-blur-md">
          <span className="italic">{artifact.title}</span>
          <span className="flex">
            {Array.from({ length: artifact.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-2.5 w-2.5 fill-amber-200/90 text-amber-200/90"
              />
            ))}
          </span>
        </div>,
      );

    case "favorite":
      return wrap(
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[oklch(0.18_0.02_270_/_0.85)] px-2.5 py-1.5 text-[9px] text-foreground/85 shadow-[0_14px_32px_-14px_oklch(0_0_0/0.8)] backdrop-blur-md">
          <Bookmark className="h-2.5 w-2.5 fill-rose-300/80 text-rose-300/80" />
          {artifact.label}
        </div>,
      );

    default:
      return null;
  }
}

/* Re-export to satisfy tree-shaken icon imports if needed elsewhere. */
export { Ticket };

