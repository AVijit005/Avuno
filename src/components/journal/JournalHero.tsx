import { motion } from "motion/react";
import { NotebookPen } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CountUp } from "@/components/analytics/AnalyticsKit";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { countWords } from "@/lib/utils/words";
import type { UIJournalEntry } from "@/lib/adapters/types";

interface Props {
  isLoading: boolean;
  stats: { journalCount: number; writingStreak: number } | null;
  entries: UIJournalEntry[];
  favoriteMood: string | null;
}

export function JournalHero({ isLoading, stats, entries, favoriteMood }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <PremiumGlass
        interactive
        variant="strong"
        className="relative overflow-hidden rounded-[40px] p-10 md:p-16 transform-gpu isolate"
        glow="oklch(0.7 0.18 35 / 0.35)"
      >
        <div className="relative z-10 pointer-events-auto">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground flex items-center gap-2">
            <NotebookPen className="h-3 w-3 text-primary" /> Journal
          </div>
          <h1 className="mt-5 font-display text-5xl tracking-tight md:text-7xl">
            <span className="text-gradient-aurora">Words for the stories</span>
            <br />
            that stayed.
          </h1>
          {isLoading ? (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-20 rounded-2xl" variant="glass" />
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { l: "Entries", v: stats?.journalCount ?? 0 },
                { l: "Current streak", v: stats?.writingStreak ?? 0, s: "d" },
                {
                  l: "Words written",
                  v: entries.reduce((acc, cur) => acc + countWords(cur.content), 0),
                },
                { l: "Favorite mood", v: favoriteMood ?? "—" },
              ].map((s) => (
                <PremiumGlass
                  key={s.l}
                  interactive
                  variant="subtle"
                  className="relative z-10 overflow-hidden p-4 cursor-pointer press-scale"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="mt-2 font-display text-3xl tracking-tight">
                    {typeof s.v === "number" ? (
                      <CountUp to={s.v} suffix={(s as { s?: string }).s ?? ""} />
                    ) : (
                      s.v
                    )}
                  </div>
                </PremiumGlass>
              ))}
            </div>
          )}
        </div>
      </PremiumGlass>
    </motion.section>
  );
}
