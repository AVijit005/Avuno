import { motion, useReducedMotion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Library, BookOpen, Heart, Calendar, BarChart3, ArrowRight, Sparkles } from "lucide-react";

/**
 * ConnectedSystemVisual: Flagship centerpiece
 *
 * Shows the core Avuno narrative:
 * Library → Journal → Memory → Timeline → Analytics
 *
 * This is the "I have never seen a media product presented like this" moment.
 */

const SYSTEM_NODES = [
  {
    id: "library",
    icon: Library,
    label: "Library",
    title: "Collect",
    description:
      "Eight media types. One unified home for everything you watch, read, play, and listen to.",
    accent: "oklch(0.65 0.2 230)",
    examples: ["Movies", "Books", "Games", "Anime", "Podcasts"],
  },
  {
    id: "journal",
    icon: BookOpen,
    label: "Journal",
    title: "Reflect",
    description:
      "Write what you felt while it's fresh. Rate, tag mood, save thoughts. Yours forever.",
    accent: "oklch(0.72 0.16 80)",
    examples: ["Private entries", "Mood tracking", "Prompts", "Rich text"],
  },
  {
    id: "memory",
    icon: Heart,
    label: "Memory",
    title: "Preserve",
    description:
      "When something matters more than a rating, mark it as a memory. The moments that shaped you.",
    accent: "oklch(0.62 0.2 295)",
    examples: ["Evidence", "Context", "Connections", "Meaning"],
  },
  {
    id: "timeline",
    icon: Calendar,
    label: "Timeline",
    title: "Chronicle",
    description:
      "Every story you finished, every reflection you wrote — threaded chronologically across years.",
    accent: "oklch(0.7 0.18 25)",
    examples: ["Chronological", "Searchable", "Complete", "Yours"],
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    title: "Discover",
    description:
      "Patterns emerge. Genres, rhythms, streaks. Not a productivity dashboard — a mirror of taste.",
    accent: "oklch(0.68 0.19 140)",
    examples: ["Genre trends", "Streaks", "Insights", "Wrapped"],
  },
];

export function ConnectedSystemVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const reduced = useReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section
      id="connected-system"
      ref={containerRef}
      className="relative px-6 py-32 md:px-10 md:py-40 overflow-hidden"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, oklch(0.72 0.18 255 / 0.08) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-primary/90 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            The Connected System
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tight max-w-4xl mx-auto leading-[1.05]">
            <span className="text-gradient-aurora">One experience.</span>
            <br />
            <span className="italic text-muted-foreground">Five connected layers.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Avuno isn't five separate pages. It's a living system where every layer knows about the
            others — and your story flows through all of them.
          </p>
        </motion.div>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection spine */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

            {/* Nodes */}
            <div className="relative grid grid-cols-5 gap-6">
              {SYSTEM_NODES.map((node, i) => {
                const Icon = node.icon;
                const isActive = activeNode === node.id;
                const isAnyActive = activeNode !== null;
                const shouldDim = isAnyActive && !isActive;

                return (
                  <div key={node.id} className="relative">
                    {/* Connecting line */}
                    {i < SYSTEM_NODES.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                        className="absolute top-1/2 -right-6 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent origin-left"
                      />
                    )}

                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      onMouseEnter={() => setActiveNode(node.id)}
                      onMouseLeave={() => setActiveNode(null)}
                      onClick={() => setActiveNode(isActive ? null : node.id)}
                      className={`group relative w-full text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl ${
                        shouldDim ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      <div
                        className={`glass-elevated rounded-2xl p-6 border transition-all duration-500 ${
                          isActive
                            ? "border-primary/30 shadow-2xl scale-105"
                            : "border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className="inline-flex items-center justify-center h-12 w-12 rounded-2xl ring-1 ring-white/10 mb-4 transition-transform duration-500 group-hover:scale-110"
                          style={{
                            background: `${node.accent}15`,
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: node.accent }} />
                        </div>

                        {/* Label */}
                        <div
                          className="text-[10px] uppercase tracking-widest mb-2 font-medium"
                          style={{ color: node.accent }}
                        >
                          {node.label}
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-2xl text-foreground mb-3">{node.title}</h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                          {node.description}
                        </p>

                        {/* Examples (show on active) */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                            {node.examples.map((ex) => (
                              <span
                                key={ex}
                                className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/60"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      {/* Step number */}
                      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-background ring-2 ring-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Flow */}
        <div className="lg:hidden space-y-6">
          {SYSTEM_NODES.map((node, i) => {
            const Icon = node.icon;
            const isActive = activeNode === node.id;

            return (
              <div key={node.id} className="relative">
                {/* Connecting line */}
                {i < SYSTEM_NODES.length - 1 && (
                  <div className="absolute left-6 top-[100%] w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
                )}

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveNode(isActive ? null : node.id)}
                  className="group relative w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                >
                  <div
                    className={`glass-elevated rounded-2xl p-5 border transition-all duration-300 ${
                      isActive ? "border-primary/30 shadow-xl" : "border-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="shrink-0 h-12 w-12 rounded-2xl ring-1 ring-white/10 flex items-center justify-center"
                        style={{ background: `${node.accent}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: node.accent }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="text-[10px] uppercase tracking-widest font-medium"
                            style={{ color: node.accent }}
                          >
                            {String(i + 1).padStart(2, "0")} · {node.label}
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-foreground mb-2">{node.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {node.description}
                        </p>

                        {/* Examples */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                            {node.examples.map((ex) => (
                              <span
                                key={ex}
                                className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/60"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      {/* Expand indicator */}
                      <motion.div
                        animate={{ rotate: isActive ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 mt-1"
                      >
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-20 md:mt-28"
        >
          <div className="inline-block glass-subtle rounded-2xl px-6 py-4 border border-primary/10">
            <p className="text-sm text-muted-foreground max-w-2xl">
              <span className="text-primary font-medium">This is not a watchlist.</span> It's a
              complete personal media operating system where Library, Journal, Memory, Timeline, and
              Analytics all flow into each other.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
