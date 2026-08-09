import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";
import { useIntelligence } from "@/hooks/use-analytics";

interface Props {
  className?: string;
}

/**
 * Patterns observed in the user's library.
 *
 * This previously rendered five hardcoded sentences under the heading "What
 * Avuno notices" — including "You haven't played a game in 28 days" and "You
 * always revisit Studio Ghibli after stressful weeks". None were derived from
 * anything; every user saw the same five, and the app does not record the
 * time-of-day or mood data two of them claimed to know.
 *
 * Now backed by /analytics/intelligence. Renders nothing when there is not
 * enough history to say something true.
 */
export function RecommendationInsights({ className }: Props) {
  const { data } = useIntelligence();
  const statements = data?.personalStatements ?? [];

  if (statements.length === 0) return null;

  return (
    <section aria-label="Recommendation insights" className={cn("space-y-4", className)}>
      <header>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          Quiet patterns
        </div>
        <h2 className="font-display text-2xl tracking-tight">What Avuno notices</h2>
      </header>
      <ul className="grid gap-2 md:grid-cols-2">
        {statements.map((s) => (
          <li key={s.statement}>
            <PremiumGlass variant="subtle">
              <div className="p-4">
                <p className="text-sm leading-relaxed text-foreground/80">{s.statement}</p>
                {s.evidence && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{s.evidence}</p>
                )}
              </div>
            </PremiumGlass>
          </li>
        ))}
      </ul>
    </section>
  );
}
