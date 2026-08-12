import { motion } from "motion/react";

export function WrappedPreview() {
  return (
    <div className="glass-elevated relative overflow-hidden rounded-[40px] p-10 md:p-16">
      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
          Your year, told back
        </div>
        <h2 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">
          <span className="text-gradient-aurora">Wrapped, but for everything.</span>
        </h2>
        <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
          At the end of every year Avuno replays your most-loved stories — your genres, your binges,
          the books that stayed. Your numbers, not anyone else's.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Hours consumed", example: true },
            { label: "Stories completed", example: true },
            { label: "Longest session", example: true },
            { label: "Favourite genre", example: true },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7 }}
              className="glass rounded-2xl p-5"
            >
              <div className="h-8 w-16 rounded-lg bg-white/[0.06] mb-3" aria-hidden />
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 text-[10px] text-white/30 uppercase tracking-widest">
                Your data
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground/50">
          Numbers above will reflect your own activity once you start tracking.
        </p>
      </div>
    </div>
  );
}
