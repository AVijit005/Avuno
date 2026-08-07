import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumProgress } from "@/components/ui/PremiumProgress";
import type { Challenge } from "@/lib/challenges";
import { cn } from "@/lib/utils";

export function ChallengeCard({
  challenge: c,
  className,
}: {
  challenge?: Challenge;
  className?: string;
}) {
  if (!c) return null;
  const pct = Math.round((c.current / c.target) * 100);
  return (
    <PremiumGlass variant="subtle" glow={c.accent} className={cn("h-full", className)}>
      <article className="p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
          {c.kind} challenge
        </div>
        <h3 className="mt-1 font-display text-lg tracking-tight">{c.title}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">{c.description}</p>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
          <span>
            {c.current} / {c.target}
          </span>
          {c.expiresIn && <span>{c.expiresIn}</span>}
        </div>
        <PremiumProgress value={pct} accent={c.accent} className="mt-2" />
        <div className="mt-3 text-[11px] text-muted-foreground">Reward · {c.reward}</div>
        {c.suggestions.length > 0 && (
          <ul className="mt-3 flex gap-2">
            {c.suggestions.slice(0, 3).map((m) => (
              <li key={m.id}>
                <img
                  src={m.posterUrl || undefined}
                  alt=""
                  className="h-12 w-9 rounded-md object-cover ring-1 ring-white/10"
                />
              </li>
            ))}
          </ul>
        )}
      </article>
    </PremiumGlass>
  );
}
