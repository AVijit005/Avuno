import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useLibrary } from "@/hooks/use-library";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { Capsule } from "@/lib/memoryInsights";
import { cn } from "@/lib/utils";

interface Props {
  capsule: Capsule;
  className?: string;
}

export function MemoryCapsule({ capsule, className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  const covers = capsule.coverIds
    .map((id) => MEDIA.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);
  return (
    <PremiumGlass variant="default" className={className}>
      <article className="p-5" aria-label={`Memory capsule: ${capsule.name}`}>
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl">
          {covers.slice(0, 3).map((c) => (
            <img key={c.id} src={c.poster} alt={c.title} className="h-24 w-full object-cover" />
          ))}
          {covers.length < 3 &&
            Array.from({ length: 3 - covers.length }).map((_, i) => (
              <div key={i} className="h-24 w-full bg-white/[0.03]" />
            ))}
        </div>
        <header className="mt-3">
          <h3 className="font-display text-lg tracking-tight">{capsule.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {capsule.count} {capsule.count === 1 ? "story" : "stories"}
          </p>
        </header>
        <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground")}>
          {capsule.description}
        </p>
      </article>
    </PremiumGlass>
  );
}
