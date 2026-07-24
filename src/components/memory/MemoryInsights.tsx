import { Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/use-analytics";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  max?: number;
}

export function MemoryInsights({ className, max = 4 }: Props) {
  const { data: insights } = useInsights();
  
  if (!insights) return null;

  const lines = [
    `Your most active weekday is usually ${insights.mostActiveWeekday}.`,
    insights.favoriteGenre ? `You tend to gravitate towards ${insights.favoriteGenre} stories.` : null,
    insights.mostProductiveMonth ? `Your most productive month for consumption was ${insights.mostProductiveMonth}.` : null,
    insights.longestBinge ? `Your longest uninterrupted binge lasted ${insights.longestBinge}.` : null,
    insights.averageCompletionTime ? `You average ${insights.averageCompletionTime} days to complete a story.` : null,
  ].filter(Boolean) as string[];

  const displayLines = lines.slice(0, max);
  
  if (displayLines.length === 0) return null;

  return (
    <PremiumGlass variant="subtle" className={className}>
      <section className="p-5 md:p-6" aria-label="Memory insights">
        <header className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
          <Sparkles className="h-3 w-3" /> What Chronicle noticed
        </header>
        <ul className="mt-4 space-y-2.5">
          {displayLines.map((l) => (
            <li
              key={l}
              className={cn(
                "font-display text-base leading-snug tracking-tight text-foreground/85",
              )}
            >
              {l}
            </li>
          ))}
        </ul>
      </section>
    </PremiumGlass>
  );
}
