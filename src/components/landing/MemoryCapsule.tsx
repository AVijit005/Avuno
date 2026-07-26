import { motion } from "motion/react";

const MEMORIES = [
  {
    media: { id: "interstellar", title: "Interstellar", backdrop: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)", poster: "linear-gradient(135deg, #1a1e2e 0%, #16313e 50%, #0f5260 100%)" },
    moment: "Late 2017 · Studio City",
    note: "Watched alone at 2 AM. Felt small in the best way.",
    mood: "Awe",
  },
  {
    media: { id: "elden-ring", title: "Elden Ring", backdrop: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)", poster: "linear-gradient(135deg, #2e1a1a 0%, #4a2d2d 50%, #7a3d3d 100%)" },
    moment: "Winter 2021 · Long flight",
    note: "12 hours, one save file. Lost track of time entirely.",
    mood: "Immersed",
  },
  {
    media: { id: "dark-side", title: "The Dark Side of the Moon", backdrop: "linear-gradient(135deg, #1e2a1e 0%, #2d4a2d 50%, #3d7a3d 100%)", poster: "linear-gradient(135deg, #1e2a1e 0%, #2d4a2d 50%, #3d7a3d 100%)" },
    moment: "Spring 2019 · Roadtrip",
    note: "On loop crossing Arizona. Still tastes like that summer.",
    mood: "Wistful",
  },
];

export function MemoryCapsule() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
          <span className="text-foreground">Years from now,</span>
          <br />
          <span className="italic text-muted-foreground">you'll remember why you watched it.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Avuno holds the feeling, not just the file. Notes, moods, moments — preserved beside
          every story.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {MEMORIES.map((m, i) => (
          <motion.div
            key={m.media.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.12, duration: 0.8 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-5"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src={m.media.backdrop ?? m.media.poster}
                alt={m.media.title}
                className="h-full w-full object-cover blur-[1px] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                  {m.moment}
                </div>
                <div className="font-display text-lg text-white">{m.media.title}</div>
              </div>
            </div>
            <p className="mt-4 text-sm italic text-muted-foreground">"{m.note}"</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {m.mood}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
