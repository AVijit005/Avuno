import { motion } from "motion/react";
import { Plus, FolderOpen, PenLine, Link2, BarChart3, ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    verb: "Add",
    feature: "Library",
    icon: Plus,
    headline: "Build your library",
    description:
      "Add movies, series, anime, books, manga, games, music, podcasts, courses, and YouTube. Every kind of story you experience lives in one place.",
    accent: "oklch(0.65 0.2 230)",
  },
  {
    number: "02",
    verb: "Organize",
    feature: "Collections",
    icon: FolderOpen,
    headline: "Curate with intention",
    description:
      "Group anything with anything — a genre retrospective, a seasonal shelf, a mood-based playlist. Status tracks your progress: planning, in-progress, completed, dropped.",
    accent: "oklch(0.78 0.18 50)",
  },
  {
    number: "03",
    verb: "Reflect",
    feature: "Journal",
    icon: PenLine,
    headline: "Capture what it meant",
    description:
      "Write a journal entry while the experience is fresh. Rate it. Return to it later. The journal belongs to you — not a public review feed.",
    accent: "oklch(0.72 0.16 80)",
  },
  {
    number: "04",
    verb: "Connect",
    feature: "Memories",
    icon: Link2,
    headline: "Preserve the moments",
    description:
      "When something matters more than a rating, mark it as a memory. Attach a note, a place, a mood. The memory lives alongside the media — not separate from it.",
    accent: "oklch(0.62 0.2 295)",
  },
  {
    number: "05",
    verb: "Discover",
    feature: "Analytics",
    icon: BarChart3,
    headline: "See your patterns",
    description:
      "Your activity, genre distribution, and consumption rhythm — visualized clearly. Not a productivity dashboard. A mirror of your taste.",
    accent: "oklch(0.7 0.18 25)",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">
            How it works
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Five steps. <span className="italic text-muted-foreground">One connected system.</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            Avuno is not five isolated pages. It is one personal media system where every layer
            connects to the next.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-4 md:grid-cols-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="glass-elevated group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1 ring-white/[0.06]"
              >
                {/* Accent glow on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(200px circle at 50% 0%, ${step.accent}20, transparent 70%)`,
                  }}
                />

                <div className="relative flex flex-col flex-1">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-5xl text-white/[0.07] leading-none">
                      {step.number}
                    </span>
                    <div
                      className="grid h-9 w-9 place-items-center rounded-2xl ring-1 ring-white/10"
                      style={{ background: `${step.accent}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: step.accent }} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div
                      className="text-[10px] uppercase tracking-widest mb-1"
                      style={{ color: step.accent }}
                    >
                      {step.verb} → {step.feature}
                    </div>
                    <h3 className="font-display text-lg leading-tight text-foreground">
                      {step.headline}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector arrow (except last) */}
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-4 w-4 text-white/20" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(180deg, transparent, oklch(0.14 0.012 270 / 0.6))" }}
      />
    </section>
  );
}
