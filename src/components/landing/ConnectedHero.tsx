import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Star,
  Heart,
  Calendar,
  BarChart3,
  BookOpen,
  Film,
  Gamepad2,
  Headphones,
} from "lucide-react";
import { useMouseParallax } from "@/lib/useParallax";
import { MagneticButton } from "./MagneticButton";

/**
 * ConnectedHero: World-class landing hero
 *
 * OBJECTIVE: Make visitors immediately understand:
 * - What Avuno is (personal media archive)
 * - How it's different (connected system)
 * - The magic moment (Library → Journal → Memory → Timeline → Analytics)
 *
 * INTERACTION: Hover/click media card to reveal connected layers
 */

const DEMO_MEDIA = {
  title: "Interstellar",
  type: "Movie",
  year: "2014",
  rating: 5,
  director: "Christopher Nolan",
  status: "Completed",
};

const DEMO_JOURNAL = {
  text: "The docking scene is one of the best sequences ever committed to film. The way Zimmer's score builds tension while Cooper manually docks the spinning Endurance... stayed with me for days.",
  date: "Nov 12, 2024",
  mood: "Awestruck",
  wordCount: 38,
};

const DEMO_MEMORY = {
  title: "IMAX experience that changed my perspective",
  context: "Watched alone, late showing",
  preserved: "Nov 12, 2024",
};

const DEMO_TIMELINE = {
  events: [
    { date: "Nov 12", label: "Completed", type: "media" },
    { date: "Nov 12", label: "Journal entry written", type: "journal" },
    { date: "Nov 12", label: "Memory preserved", type: "memory" },
  ],
};

const DEMO_ANALYTICS = {
  genreTop: "Sci-Fi",
  moviesThisMonth: 8,
  avgRating: 4.2,
};

export function ConnectedHero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);

  const { x: mx, y: my } = useMouseParallax(12);
  const reduced = useReducedMotion();

  const [activeLayer, setActiveLayer] = useState<
    "media" | "journal" | "memory" | "timeline" | "analytics" | null
  >(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const showConnection = (layer: typeof activeLayer) => {
    setActiveLayer(layer);
    if (!hasInteracted) setHasInteracted(true);
  };

  const px = useTransform(mx, (v) => (reduced ? 0 : v * 0.6));
  const py = useTransform(my, (v) => (reduced ? 0 : v * 0.6));

  return (
    <section
      ref={ref}
      className="relative min-h-screen px-6 pt-32 pb-20 md:px-10 md:pt-36 md:pb-28"
    >
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="mx-auto max-w-7xl">
        {/* Headline */}
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 glass-subtle rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-primary/90 mb-6"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            The Connected Archive
          </motion.div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-[7rem] max-w-5xl mx-auto">
            {["Your", "personal", "media", "archive", "—", "connected."].map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block text-gradient-aurora whitespace-pre"
              >
                {word === "—" ? word + " " : word + " "}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Every movie, book, game, and podcast you experience.
            <br />
            Connected to what you thought, remembered, and discovered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticButton>
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-black press-scale animate-pulse-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Start with Avuno
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.15}>
              <button
                onClick={() => {
                  document
                    .getElementById("connected-system")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-medium press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                See how it connects
              </button>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Interactive Connected System Demo */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-24 md:mt-32"
        >
          {!hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 text-xs text-primary/70 uppercase tracking-widest flex items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.div>
              Click to explore the connection
            </motion.div>
          )}

          <motion.div
            style={{ x: px, y: py }}
            className="relative mx-auto max-w-6xl h-[500px] md:h-[600px] perspective-1200"
          >
            {/* Base Layer: Media Card (Always visible) */}
            <motion.button
              onClick={() => showConnection(activeLayer === "journal" ? null : "journal")}
              onMouseEnter={() => !activeLayer && showConnection("journal")}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 glass-elevated rounded-2xl border border-white/10 shadow-2xl overflow-hidden w-[320px] md:w-[400px] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-[1.02]"
            >
              <div className="flex gap-4 p-5 md:p-6 bg-gradient-to-br from-white/[0.03] to-transparent">
                {/* Poster */}
                <div className="w-20 md:w-24 shrink-0 aspect-[2/3] rounded-xl bg-gradient-to-br from-[#2e1e2a] via-[#4a2d3d] to-[#7a3d5c] flex items-center justify-center">
                  <Film className="h-8 w-8 text-white/20" />
                </div>
                {/* Meta */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-primary/80 mb-1">
                    {DEMO_MEDIA.type}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-white">
                    {DEMO_MEDIA.title}
                  </h3>
                  <div className="text-xs text-white/50 mt-1">
                    {DEMO_MEDIA.director} · {DEMO_MEDIA.year}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-0.5">
                      {[...Array(DEMO_MEDIA.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">·</span>
                    <span className="text-xs text-primary/70 uppercase tracking-wider">
                      {DEMO_MEDIA.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Layer 1: Journal Entry */}
            <AnimatePresence>
              {(activeLayer === "journal" ||
                activeLayer === "memory" ||
                activeLayer === "timeline" ||
                activeLayer === "analytics") && (
                <motion.button
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => showConnection(activeLayer === "memory" ? "journal" : "memory")}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[160px] md:translate-y-[180px] md:-ml-[120px] z-20 glass rounded-2xl border border-primary/20 shadow-xl p-5 md:p-6 w-[280px] md:w-[340px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest text-primary/80">
                      Journal Entry
                    </span>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed italic font-serif">
                    "{DEMO_JOURNAL.text}"
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-white/40">
                    <span>{DEMO_JOURNAL.date}</span>
                    <span>
                      {DEMO_JOURNAL.wordCount} words · {DEMO_JOURNAL.mood}
                    </span>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Layer 2: Memory */}
            <AnimatePresence>
              {(activeLayer === "memory" ||
                activeLayer === "timeline" ||
                activeLayer === "analytics") && (
                <motion.button
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[160px] md:translate-y-[180px] md:ml-[120px] z-20 glass rounded-2xl border border-primary/20 shadow-xl p-5 md:p-6 w-[280px] md:w-[340px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-primary fill-primary/30" />
                    <span className="text-[10px] uppercase tracking-widest text-primary/80">
                      Memory
                    </span>
                  </div>
                  <h4 className="font-display text-base text-white">{DEMO_MEMORY.title}</h4>
                  <p className="text-sm text-white/60 mt-2">{DEMO_MEMORY.context}</p>
                  <div className="text-[11px] text-white/40 mt-3 uppercase tracking-widest">
                    Preserved {DEMO_MEMORY.preserved}
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Layer 3: Timeline Preview */}
            <AnimatePresence>
              {(activeLayer === "timeline" || activeLayer === "analytics") && (
                <motion.button
                  initial={{ opacity: 0, x: -40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  onClick={() =>
                    showConnection(activeLayer === "analytics" ? "timeline" : "analytics")
                  }
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[-170px] md:translate-y-[-200px] md:-ml-[180px] z-15 glass rounded-2xl border border-white/10 shadow-lg p-4 md:p-5 w-[240px] md:w-[280px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-[10px] uppercase tracking-widest text-primary/70">
                      Timeline
                    </span>
                  </div>
                  <div className="space-y-2">
                    {DEMO_TIMELINE.events.map((event, i) => (
                      <div key={i} className="flex items-start gap-3 relative pl-3">
                        <div className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary/50" />
                        <div>
                          <div className="text-xs text-white/90">{event.label}</div>
                          <div className="text-[10px] text-white/40">{event.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Layer 4: Analytics Preview */}
            <AnimatePresence>
              {activeLayer === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, x: 40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-[-170px] md:translate-y-[-200px] md:ml-[180px] z-15 glass rounded-2xl border border-white/10 shadow-lg p-4 md:p-5 w-[240px] md:w-[280px] text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-[10px] uppercase tracking-widest text-primary/70">
                      Analytics
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                        Top Genre
                      </div>
                      <div className="text-lg font-display text-white">
                        {DEMO_ANALYTICS.genreTop}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                          This Month
                        </div>
                        <div className="text-lg font-display text-white">
                          {DEMO_ANALYTICS.moviesThisMonth}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                          Avg Rating
                        </div>
                        <div className="text-lg font-display text-white">
                          {DEMO_ANALYTICS.avgRating}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connection Lines */}
            <AnimatePresence>
              {activeLayer && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                  {activeLayer === "journal" && (
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.3 }}
                      exit={{ pathLength: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      x1="50%"
                      y1="50%"
                      x2="calc(50% - 80px)"
                      y2="calc(50% + 170px)"
                      stroke="oklch(0.72 0.18 255)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}
                </svg>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Floating Media Type Icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute inset-0 pointer-events-none hidden md:block"
          >
            {[
              { Icon: Film, delay: 0, x: "10%", y: "20%" },
              { Icon: BookOpen, delay: 0.1, x: "85%", y: "25%" },
              { Icon: Gamepad2, delay: 0.2, x: "15%", y: "75%" },
              { Icon: Headphones, delay: 0.3, x: "80%", y: "70%" },
            ].map(({ Icon, delay, x, y }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.15, scale: 1 }}
                transition={{ delay: 2.5 + delay, duration: 0.6 }}
                style={{ left: x, top: y }}
                className="absolute"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon className="h-12 w-12 text-primary" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
