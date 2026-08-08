import { motion } from "motion/react";
import { getGreeting } from "@/lib/dashboardGreeting";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDashboard, useStreaks, useOverview } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";

export function DashboardGreeting({ className }: { className?: string }) {
  const { data: user, isLoading: l1 } = useCurrentUser();
  const { data: dashboard, isLoading: l2 } = useDashboard();
  const { data: streaks, isLoading: l3 } = useStreaks();
  const { data: overview, isLoading: l4 } = useOverview();
  const isLoading = l1 || l2 || l3 || l4;

  if (isLoading) {
    return (
      <section aria-label="Greeting" className={cn("space-y-2", className)}>
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10 md:h-9 md:w-80" />
        <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
      </section>
    );
  }

  const name = user?.name ? user.name.split(" ")[0] : "Traveler";
  const g = getGreeting({
    name: name,
    streak: streaks?.currentStreak,
    recentCompletions: overview?.moviesCompleted, // using as proxy
    unfinishedTitle: dashboard?.continueWatching?.[0]?.title,
  });
  return (
    <section aria-label="Greeting" className={cn("space-y-1", className)}>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.large, ease: ease.out }}
        className="font-display text-2xl tracking-tight md:text-3xl"
      >
        {g.title}
      </motion.h2>
      {g.subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.normal, ease: ease.out, delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          {g.subtitle}
        </motion.p>
      )}
    </section>
  );
}
