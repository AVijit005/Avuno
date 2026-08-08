import { useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { useState } from "react";
import { Play, BookOpen, Gamepad2, Music2, Sparkles, Film } from "lucide-react";

const MODES = [
  {
    id: "movie",
    label: "Movies",
    icon: Film,
    item: {
      id: "interstellar",
      title: "Interstellar",
      creator: "Christopher Nolan",
      runtime: "2h 49m",
      progress: 68,
      backdrop: "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)",
      poster: "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)",
    },
    accent: "oklch(0.65 0.2 230)",
  },
  {
    id: "anime",
    label: "Anime",
    icon: Sparkles,
    item: {
      id: "one-piece",
      title: "One Piece",
      creator: "Eiichiro Oda",
      runtime: "Episode 1071",
      progress: 42,
      backdrop: "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
      poster: "linear-gradient(135deg, #1a2e2d 0%, #164a4a 50%, #0f7a6f 100%)",
    },
    accent: "oklch(0.78 0.18 50)",
  },
  {
    id: "book",
    label: "Books",
    icon: BookOpen,
    item: {
      id: "harry-potter",
      title: "Harry Potter and the Sorcerer's Stone",
      creator: "J.K. Rowling",
      runtime: "Page 342",
      progress: 55,
      backdrop: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
      poster: "linear-gradient(135deg, #2e2a1e 0%, #4a3d2d 50%, #7a5c3d 100%)",
    },
    accent: "oklch(0.62 0.2 295)",
  },
  {
    id: "game",
    label: "Games",
    icon: Gamepad2,
    item: {
      id: "elden-ring",
      title: "Elden Ring",
      creator: "FromSoftware",
      runtime: "84 Hours",
      progress: 75,
      backdrop: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)",
      poster: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)",
    },
    accent: "oklch(0.72 0.16 80)",
  },
  {
    id: "music",
    label: "Music",
    icon: Music2,
    item: {
      id: "dark-side",
      title: "The Dark Side of the Moon",
      creator: "Pink Floyd",
      runtime: "Track 4",
      progress: 40,
      backdrop: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
      poster: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)",
    },
    accent: "oklch(0.7 0.18 25)",
  },
];

export function DashboardShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const [mode, setMode] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(MODES.length - 1, Math.max(0, Math.floor(v * MODES.length * 0.95)));
    if (idx !== mode) setMode(idx);
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -6]);
  const current = MODES[mode];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      {/* Mode pills */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setMode(i)}
            className={`glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition press-scale ${
              i === mode
                ? "text-foreground ring-1 ring-primary/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <m.icon className="h-3.5 w-3.5" /> {m.label}
          </button>
        ))}
      </div>

      <motion.div
        style={{ rotateX, transformPerspective: 1400 }}
        className="glass-strong relative mx-auto overflow-hidden rounded-[36px] p-3 md:p-4"
      >
        <div className="relative aspect-[16/9.5] w-full overflow-hidden rounded-[28px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.item.id}
              src={current.item.backdrop ?? current.item.poster}
              alt=""
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(110deg, oklch(0.1 0.02 270 / 0.92) 0%, oklch(0.1 0.02 270 / 0.55) 45%, transparent 80%), radial-gradient(80% 60% at 90% 10%, ${current.accent}/0.35, transparent 55%)`,
            }}
          />

          {/* "App" chrome */}
          <div className="relative grid h-full grid-cols-12 gap-4 p-6 md:p-10">
            <div className="col-span-3 hidden flex-col gap-2 md:flex">
              <div className="glass-subtle flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-primary" /> Continue
              </div>
              {["Library", "Collections", "Journal", "Timeline", "Wrapped"].map((l) => (
                <div key={l} className="rounded-xl px-3 py-2 text-xs text-white/70">
                  {l}
                </div>
              ))}
            </div>
            <div className="col-span-12 flex flex-col justify-end md:col-span-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/70">
                    <Icon className="h-3 w-3" /> Continuing
                  </div>
                  <div className="mt-2 font-display text-3xl text-white md:text-5xl">
                    {current.item.title}
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    {current.item.creator} · {current.item.runtime}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/15">
                      <motion.div
                        key={current.id + "-bar"}
                        initial={{ width: 0 }}
                        animate={{ width: `${current.item.progress ?? 0}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                    <span className="text-[10px] text-white/60">{current.item.progress ?? 0}%</span>
                  </div>
                  <button className="glass mt-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white press-scale">
                    <Play className="h-3 w-3" /> Resume
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent mix-blend-overlay opacity-0 transition duration-[800ms] group-hover:opacity-100"
          />
        </div>
      </motion.div>
    </div>
  );
}
