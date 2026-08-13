import { motion } from "motion/react";
import { NotebookPen } from "lucide-react";
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 border-b border-border/40 pb-12"
    >
      <div className="relative z-10 pointer-events-auto">
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground flex items-center gap-2">
          <NotebookPen className="h-3 w-3 text-primary" /> Journal
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl text-foreground">
          Words for the stories
          <br />
          that stayed.
        </h1>
        {isLoading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerSkeleton key={i} className="h-20 rounded-2xl" />
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
              <motion.div
                key={s.l}
                className="rounded-xl glass-subtle p-4"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.l}
                </div>
                <div className="mt-2 font-display text-3xl tracking-tight text-foreground">
                  {typeof s.v === "number" ? (
                    <CountUp to={s.v} suffix={(s as { s?: string }).s ?? ""} />
                  ) : (
                    s.v
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
