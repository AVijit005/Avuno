import { motion } from "motion/react";
import { CountUp } from "./CountUp";

const STATS = [
  { label: "Hours watched", to: 1284, suffix: "h" },
  { label: "Stories completed", to: 312 },
  { label: "Longest marathon", to: 14, suffix: "h" },
  { label: "Favorite year", to: 2024 },
];

export function WrappedPreview() {
  return (
    <div className="glass-strong relative overflow-hidden rounded-[40px] p-10 md:p-16">
      <motion.div
        className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "var(--secondary)", opacity: 0.4 }}
        animate={{ x: [0, 30, -10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "var(--primary)", opacity: 0.35 }}
        animate={{ x: [0, -20, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
          Your year, told back
        </div>
        <h2 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">
          <span className="text-gradient-aurora">Wrapped, but for everything.</span>
        </h2>
        <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
          At the end of every year Chronicle replays your most-loved stories as a cinematic short —
          your genres, your binges, the books that stayed.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7 }}
              className="glass rounded-2xl p-5"
            >
              <div
                className="font-display text-3xl md:text-4xl"
                style={{ textShadow: "0 0 30px oklch(0.72 0.18 255 / 0.6)" }}
              >
                <CountUp to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
