import { motion } from "motion/react";
import { Feather, TrendingUp } from "lucide-react";
import { TODAY } from "@/lib/memory";
import { fadeBlurIn } from "@/lib/motion";
import type { UIInsights } from "@/lib/adapters/types";

import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumSquircle } from "@/components/ui/PremiumSquircle";

interface Props {
  className?: string;
  insights: UIInsights | null;
}

export function DailyRitual({ className, insights }: Props) {
  const dateLabel = TODAY().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hasData = insights && insights.totalHoursSpent > 0;

  return (
    <PremiumGlass
      aria-label="Today's ritual"
      interactive
      glow="oklch(0.72 0.18 255 / 0.15)"
      className={`group/ritual px-6 py-10 md:px-10 md:py-14 hover:translate-y-0 active:scale-100 ${className ?? ""}`}
    >
      <motion.header
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeBlurIn}
        className="mb-8 flex items-baseline justify-between relative z-10"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85">
            Today's ritual
          </div>
          <h2 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
            What your library is whispering today
          </h2>
          <p className="mt-2 max-w-xl text-sm text-foreground/65">
            A small daily resurfacing — pulled from your own memory, not from a feed.
          </p>
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:block">
          {dateLabel}
        </div>
      </motion.header>

      {hasData ? (
        <div className="group/empty relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.03] bg-white/[0.02] p-10 text-center shadow-2xl backdrop-blur-xl transition duration-500 ease-out hover:border-white/[0.08] hover:bg-white/[0.04]">
          <PremiumSquircle icon={<TrendingUp />} size="lg" variant="glass" />
          <p className="text-sm text-foreground/70">
            Your most active day is{" "}
            <span className="text-foreground font-medium">{insights.mostActiveWeekday}</span>
            {insights.favoriteGenre ? (
              <>
                . You've spent most of your time in{" "}
                <span className="text-foreground font-medium">{insights.favoriteGenre}</span>.
              </>
            ) : (
              ". Today's a good day to pick up where you left off."
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {insights.totalHoursSpent}h across {insights.totalUniqueMedia} stories so far.
          </p>
        </div>
      ) : (
        <div className="group/empty relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.03] bg-white/[0.02] p-10 text-center shadow-2xl backdrop-blur-xl transition duration-500 ease-out hover:border-white/[0.08] hover:bg-white/[0.04]">
          <PremiumSquircle icon={<Feather />} size="lg" variant="glass" />
          <p className="text-sm text-foreground/70">
            Your ritual is still gathering — check back once there's more to reflect on.
          </p>
        </div>
      )}
    </PremiumGlass>
  );
}
