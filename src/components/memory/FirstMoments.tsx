import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useLibrary } from "@/hooks/use-library";
import { Link } from "@tanstack/react-router";
import { FIRSTS } from "@/lib/memoryInsights";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function FirstMoments({ className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  return (
    <section aria-label="Firsts" className={cn("space-y-5", className)}>
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-tight">Your firsts</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Where everything started
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {FIRSTS.map((f) => {
          const m = MEDIA.find((x) => x.id === f.mediaId);
          return (
            <li key={f.label}>
              <PremiumGlass variant="subtle">
                <Link to="/app/media/$id" params={{ id: f.mediaId }} className="block p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {f.label}
                  </div>
                  <div className="mt-2 truncate font-display text-base tracking-tight">
                    {m?.title ?? f.kind}
                  </div>
                  <time className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
                    {f.when}
                  </time>
                </Link>
              </PremiumGlass>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
