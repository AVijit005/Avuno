import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Link } from "@tanstack/react-router";

import { PremiumProgress } from "@/components/ui/PremiumProgress";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  franchises?: {
    creator: string;
    accent: string;
    current: { id: string; title: string; posterUrl: string | null; progress: number } | null;
    next: { id: string; title: string; posterUrl: string | null } | null;
    totalWorks: number;
    completedWorks: number;
  }[];
}

export function ContinueUniverse({ className, franchises: propFranchises }: Props) {
  const franchises = propFranchises ?? [];
  if (!franchises.length) return null;

  return (
    <section aria-label="Continue the universe" className={cn("space-y-4", className)}>
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-tight">Continue the universe</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Worlds in progress
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {franchises.slice(0, 6).map((f) => (
          <li key={f.creator}>
            <PremiumGlass variant="subtle">
              <article className="p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  {f.creator}
                </div>
                <div className="mt-1 flex items-center gap-3">
                  {f.current && <span className="text-sm font-medium">{f.current.title}</span>}
                </div>
                {f.current && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">
                      <span>{f.current.progress}%</span>
                      <span>
                        {f.completedWorks}/{f.totalWorks} works
                      </span>
                    </div>
                    <PremiumProgress value={f.current.progress} className="h-1" />
                  </div>
                )}
                {f.next && (
                  <p className="mt-2 text-[11px] text-muted-foreground">Next: {f.next.title}</p>
                )}
              </article>
            </PremiumGlass>
          </li>
        ))}
      </ul>
    </section>
  );
}
