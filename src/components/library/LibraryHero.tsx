import { motion } from "motion/react";
import { Library as LibraryIcon } from "lucide-react";
import { statusCounts, collageRecent } from "@/lib/library";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { CountUp } from "@/components/analytics/AnalyticsKit";

import { useLibraryStats } from "@/hooks/use-library";

export function LibraryHero() {
  const { data: stats } = useLibraryStats();
  const c = statusCounts();
  const posters = collageRecent(9);

  const byStatusRaw = stats?.byStatus || {};
  const total =
    stats?.total ??
    c.completed + c.in_progress + c.planning + c.paused + c.dropped + c.rewatching + c.archived;
  const completed = stats ? (byStatusRaw.COMPLETED ?? 0) : c.completed;
  const inProgress = stats
    ? (byStatusRaw.WATCHING ?? 0) +
      (byStatusRaw.READING ?? 0) +
      (byStatusRaw.PLAYING ?? 0) +
      (byStatusRaw.LISTENING ?? 0) +
      (byStatusRaw.LEARNING ?? 0)
    : c.in_progress;
  const planning = stats ? (byStatusRaw.PLANNING ?? 0) : c.planning;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Background poster grid that sits BEHIND the glass, allowing the PremiumGlass to blur it natively */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-[40px]">
        <div className="grid h-full w-full grid-cols-9 opacity-40 grayscale-[0.2]">
          {posters.map((p, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={p}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      <PremiumGlass
        interactive
        variant="strong"
        className="relative overflow-hidden rounded-[40px] p-10 md:p-16 transform-gpu isolate"
        glow="oklch(0.72 0.18 255 / 0.35)"
      >
        <div className="relative z-10 pointer-events-auto">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground flex items-center gap-2">
            <LibraryIcon className="h-3 w-3 text-primary" /> Library
          </div>
          <h1 className="mt-5 font-display text-5xl tracking-tight md:text-7xl">
            <span className="text-gradient-aurora">Your Library</span>
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
            Every story you've watched, read, played and lived.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { l: "Total", v: total },
              { l: "Completed", v: completed },
              { l: "In Progress", v: inProgress },
              { l: "Planning", v: planning },
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
                  <CountUp to={s.v} />
                </div>
              </PremiumGlass>
            ))}
          </div>
        </div>
      </PremiumGlass>
    </motion.section>
  );
}
