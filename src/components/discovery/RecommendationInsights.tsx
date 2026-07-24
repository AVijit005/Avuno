import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";

const LINES = [
  "You've been reading fewer books recently.",
  "You usually enjoy slower stories in winter.",
  "You haven't played a game in 28 days.",
  "You always revisit Studio Ghibli after stressful weeks.",
  "Your evenings tilt sci-fi, your weekends tilt drama.",
];

interface Props {
  className?: string;
}

export function RecommendationInsights({ className }: Props) {
  return (
    <section aria-label="Recommendation insights" className={cn("space-y-4", className)}>
      <header>
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/75">
          Quiet patterns
        </div>
        <h2 className="font-display text-2xl tracking-tight">What Chronicle notices</h2>
      </header>
      <ul className="grid gap-2 md:grid-cols-2">
        {LINES.map((line) => (
          <li key={line}>
            <PremiumGlass variant="subtle">
              <p className="p-4 text-sm leading-relaxed text-foreground/80">{line}</p>
            </PremiumGlass>
          </li>
        ))}
      </ul>
    </section>
  );
}
