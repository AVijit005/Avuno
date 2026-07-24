import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ArrowRight, Sparkles, ImageOff } from "lucide-react";
import { useMouseParallax } from "@/lib/useParallax";
import { MagneticButton } from "./MagneticButton";

const heroCards = [
  {
    id: "movie",
    item: { title: "Interstellar", kind: "movie", poster: "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)" },
    x: -36,
    y: -8,
    rot: -8,
    depth: 0.6,
  },
  {
    id: "anime",
    item: { title: "One Piece", kind: "anime", poster: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
    x: -14,
    y: 18,
    rot: 4,
    depth: 0.9,
  },
  {
    id: "book",
    item: { title: "Harry Potter", kind: "book", poster: "linear-gradient(135deg, #2d1b2e 0%, #4a1942 50%, #7b2d5c 100%)" },
    x: 14,
    y: -14,
    rot: -3,
    depth: 0.75,
  },
  {
    id: "game",
    item: { title: "Elden Ring", kind: "game", poster: "linear-gradient(135deg, #1e2a1e 0%, #2d4a2d 50%, #3d7a3d 100%)" },
    x: 36,
    y: 10,
    rot: 6,
    depth: 0.55,
  },
  { id: "music", item: { title: "The Dark Side of the Moon", kind: "music", poster: "https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe" }, x: 0, y: 28, rot: 0, depth: 1 },
];

export function LivingHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardConverge = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.94]);
  const { x: mx, y: my } = useMouseParallax(12);
  const reduced = useReducedMotion();

  const headline = ["Every", "story", "you", "finish"];

  return (
    <section ref={ref} className="relative px-6 pt-36 pb-24 md:px-10 md:pt-44 md:pb-32">
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="mx-auto max-w-6xl">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-subtle mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" /> Your personal media universe
          </motion.div>

          <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[6.5rem]">
            <span className="block">
              {headline.map((w, i) => (
                <motion.span
                  key={w + i}
                  initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block whitespace-pre text-gradient-aurora"
                >
                  {w + " "}
                </motion.span>
              ))}
            </span>
            <motion.span
              initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 block italic text-muted-foreground/90"
            >
              becomes part of your story.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Memora is a cinematic memory journal for everything you watch, read, play and listen
            to — beautifully organized, gently remembered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticButton>
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-medium text-black press-scale animate-pulse-glow"
              >
                Start your Memora
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.18}>
              <a
                href="#experience"
                className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium press-scale"
              >
                See how it feels
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Living card constellation */}
        <div className="relative mx-auto mt-20 h-[420px] max-w-5xl md:h-[520px]">
          {heroCards.map((c, i) => (
            <HeroCard
              key={c.id}
              c={c}
              i={i}
              mx={mx}
              my={my}
              converge={cardConverge}
              reduced={!!reduced}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

type HeroCardData = (typeof heroCards)[number];

function HeroCard({
  c,
  i,
  mx,
  my,
  converge,
  reduced,
}: {
  c: HeroCardData;
  i: number;
  mx: ReturnType<typeof useMouseParallax>["x"];
  my: ReturnType<typeof useMouseParallax>["y"];
  converge: ReturnType<typeof useTransform<number, number>>;
  reduced: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const px = useTransform(mx, (v) => v * c.depth);
  const py = useTransform(my, (v) => v * c.depth * 0.6);
  const scale = useTransform(converge, [0, 1], [1, 0.78]);
  const orbitAnim = reduced
    ? undefined
    : { y: [c.y, c.y - 8, c.y + 6, c.y], rotate: [c.rot, c.rot + 1.4, c.rot - 1.2, c.rot] };

  return (
    <motion.div
      initial={{ opacity: 0, y: c.y + 80, rotate: c.rot * 2, scale: 0.85 }}
      animate={{ opacity: 1, y: c.y, rotate: c.rot, scale: 1, ...orbitAnim }}
      transition={{
        opacity: { duration: 1, delay: 1.5 + i * 0.12 },
        scale: { duration: 1, delay: 1.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 14 + i * 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 + i * 0.12 },
        rotate: {
          duration: 16 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5 + i * 0.12,
        },
      }}
      style={{
        position: "absolute",
        left: `${50 + c.x}%`,
        top: `${50 + c.y * 0.6}%`,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: Math.round(c.depth * 10),
      }}
    >
      <motion.div
        style={{ x: px, y: py, scale }}
        className="relative aspect-[2/3] w-32 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 md:w-44 bg-gradient-to-br from-white/[0.06] to-white/[0.02]"
      >
        {!errored ? (
          <img 
            src={c.item.poster} 
            alt={c.item.title} 
            loading="lazy"
            decoding="async"
            onError={() => setErrored(true)}
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImageOff className="h-6 w-6 text-white/30" />
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">{c.item.kind}</div>
          <div className="font-display text-sm text-white">{c.item.title}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
