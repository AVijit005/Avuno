import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";

import { rankAchievements } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export function AchievementHero({ className }: { className?: string }) {
  const a = rankAchievements()[0];
  if (!a) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      aria-label="Latest milestone"
      className={cn("relative", className)}
    >
      <PremiumGlass variant="strong" glow="oklch(0.78 0.18 50 / 0.4)">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-primary/85">
            <Trophy className="h-3 w-3" /> Latest milestone
          </div>
          <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">{a.name}</h2>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">{a.caption}</p>
          {a.journalExcerpt && (
            <blockquote className="mt-4 max-w-prose border-l-2 border-primary/40 pl-4 text-[13px] italic text-foreground/80">
              "{a.journalExcerpt}"
            </blockquote>
          )}
          <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
            {a.category} · {a.earnedAt}
          </div>
        </div>
      </PremiumGlass>
    </motion.section>
  );
}
