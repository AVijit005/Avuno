import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Star, BookOpen, Trophy } from "lucide-react";

const ENTRIES = [
  {
    year: "2024",
    title: "Interstellar",
    detail: "★★★★★ · journal entry saved",
    icon: Star,
    accent: "oklch(0.65 0.2 230)",
    note: '"The docking scene still wrecks me — six viewings in."',
  },
  {
    year: "2025",
    title: "One Piece",
    detail: "Episode 850 · marathoner unlocked",
    icon: BookOpen,
    accent: "oklch(0.78 0.18 50)",
    note: '"Wano arc finished on a Sunday afternoon. Sat with it for an hour."',
  },
  {
    year: "2026",
    title: "The Witcher 3",
    detail: "Completed · memory saved",
    icon: Trophy,
    accent: "oklch(0.72 0.16 80)",
    note: '"Bittersweet credits. Geralt\'s last ride lived up to every hour."',
  },
];

export function TimelinePreview() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 30%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto max-w-3xl">
      <motion.div
        style={{ scaleY: lineScale, transformOrigin: "top" }}
        className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary via-secondary to-transparent md:left-1/2"
      />
      <div className="space-y-12">
        {ENTRIES.map((e, i) => {
          const Icon = e.icon;
          const side = i % 2 === 0 ? "md:pr-[55%]" : "md:pl-[55%]";
          return (
            <motion.div
              key={e.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`relative pl-16 md:pl-0 ${side}`}
            >
              <div
                className="glass-elevated absolute left-6 top-2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full ring-2 md:left-1/2"
                style={{ background: e.accent, boxShadow: `0 0 24px ${e.accent}` }}
              >
                <Icon className="h-2.5 w-2.5 text-white" />
              </div>
              <div className="glass rounded-3xl p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {e.year}
                </div>
                <div className="mt-1 font-display text-2xl">{e.title}</div>
                <div className="mt-1 text-xs text-primary/80">{e.detail}</div>
                <p className="mt-3 text-sm italic text-muted-foreground">{e.note}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
