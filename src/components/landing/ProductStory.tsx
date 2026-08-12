import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

const STORY_STEPS = [
  {
    step: "Add a movie",
    context: "You watched Interstellar last night.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-2">
          Library · Movie
        </div>
        <div className="font-display text-2xl text-white">Interstellar</div>
        <div className="text-xs text-white/50 mt-1">Christopher Nolan · 2014 · Completed</div>
      </div>
    ),
  },
  {
    step: "Library shows it",
    context: "Your library updates. Status: Completed. Rating: yours to give.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5 flex gap-4 items-center">
        <div
          className="h-16 w-12 shrink-0 rounded-xl"
          style={{ background: "linear-gradient(135deg, #2e1e2a 0%, #4a2d3d 50%, #7a3d5c 100%)" }}
        />
        <div className="min-w-0">
          <div className="font-display text-base text-white">Interstellar</div>
          <div className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">Completed</div>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "Journal lets you reflect",
    context: "Write what you felt. Keep it private. Return to it later.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-3">
          Journal Entry
        </div>
        <p className="text-sm text-white/80 italic leading-relaxed font-serif">
          "The docking scene is one of the best sequences ever committed to film. Stayed with me for
          hours after the credits."
        </p>
        <div className="mt-4 text-[10px] text-white/30 uppercase tracking-widest">
          Private · Interstellar
        </div>
      </div>
    ),
  },
  {
    step: "Memory preserves what mattered",
    context: "Mark the journal as a memory. Attach a place, a mood, a note.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 grid place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
          <div>
            <div className="text-xs text-white font-medium">Memory saved</div>
            <div className="text-[10px] text-white/40">Interstellar · Late 2023</div>
          </div>
        </div>
        <p className="text-sm text-white/60 italic">
          "Watched alone, IMAX. One of those nights that resets your perspective."
        </p>
      </div>
    ),
  },
  {
    step: "Timeline records it",
    context: "The experience takes its place in your personal chronology.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary to-transparent" />
          <div className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full border border-primary bg-background shadow-[0_0_8px_oklch(0.72_0.18_255/0.5)]" />
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Late 2023</div>
          <div className="font-display text-base text-white">Interstellar</div>
          <div className="text-xs text-white/50">★★★★★ · Journal saved · Memory</div>
        </div>
      </div>
    ),
  },
  {
    step: "Analytics reveals the pattern",
    context: "Over time, your taste becomes visible — genres, hours, rhythms.",
    panel: (
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-3">
          Top genre this year
        </div>
        <div className="space-y-2">
          {[
            { label: "Sci-Fi", pct: 38 },
            { label: "Drama", pct: 26 },
            { label: "Thriller", pct: 18 },
          ].map((g) => (
            <div key={g.label} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-white/60 text-right">{g.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${g.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="text-white/40">{g.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function ProductStory() {
  return (
    <section id="product-story" className="relative px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">
            The Avuno story
          </div>
          <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            One experience.{" "}
            <span className="italic text-muted-foreground">Six connected layers.</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            Avuno is not a watchlist. It is the entire arc — from the moment you press play to the
            meaning it carries years later.
          </p>
        </motion.div>

        <div className="mt-20 relative">
          {/* Vertical spine on desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent -translate-x-1/2 pointer-events-none" />

          <div className="space-y-10 md:space-y-0">
            {STORY_STEPS.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative md:flex md:items-center md:gap-10 md:py-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Text side */}
                  <div
                    className="flex-1 md:text-right md:pr-10 md:pl-0 pl-0"
                    style={{ textAlign: isLeft ? "right" : "left" }}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-primary/70 mb-1">
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-display text-2xl text-white">{s.step}</h3>
                    <p
                      className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs"
                      style={{ marginLeft: isLeft ? "auto" : undefined }}
                    >
                      {s.context}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex shrink-0 h-4 w-4 rounded-full border border-primary/40 bg-background shadow-[0_0_16px_oklch(0.72_0.18_255/0.3)] items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>

                  {/* Panel side */}
                  <div className="mt-4 md:mt-0 flex-1 md:pl-10 md:pr-0">{s.panel}</div>

                  {/* Mobile connector */}
                  {i < STORY_STEPS.length - 1 && (
                    <div className="flex justify-center mt-4 md:hidden text-white/20">
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
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
