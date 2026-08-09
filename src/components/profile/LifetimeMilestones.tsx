import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { useIntelligence } from "@/hooks/use-analytics";

/**
 * Milestones reached, by year.
 *
 * This previously rendered a fixed 2021→2026 history — "Created your Avuno",
 * "First 100 completed stories", "47-day streak — your longest yet" — shown to
 * every user regardless of when they joined or what they had done. A user who
 * signed up yesterday was told they had a five-year history.
 *
 * Now derived from the activity data behind /analytics/intelligence: one entry
 * per year the user was actually active, with their real count.
 */
export function LifetimeMilestones() {
  const { data } = useIntelligence();
  const years = data?.mediaEvolution ?? [];

  if (years.length === 0) return null;

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Your years
        </div>
        <ol className="mt-4 space-y-3">
          {years.map((y) => (
            <li
              key={y.year}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-l-2 border-primary/30 pl-3"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {y.year}
              </span>
              <span className="text-sm">
                {y.mediaCount} {y.mediaCount === 1 ? "entry" : "entries"}
                {y.topGenre ? ` · mostly ${y.topGenre}` : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </PremiumGlass>
  );
}
