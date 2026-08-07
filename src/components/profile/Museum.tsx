import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { Link } from "@tanstack/react-router";
import type { UIMediaItem } from "@/lib/adapters/types";

import { getMuseum } from "@/lib/museumEngine";
import { useLibrary } from "@/hooks/use-library";
import { adaptLibraryItem } from "@/lib/adapters/media";

export function Museum() {
  const galleries = getMuseum();
  const { data: libraryData } = useLibrary();
  const libraryItems = libraryData?.pages.flatMap(p => p.data).map(adaptLibraryItem) || [];

  return (
    <div className="space-y-6">
      {galleries.map((g) => {
        const items = g.items.map((m) => libraryItems.find(x => x.id === m.id)).filter((x): x is UIMediaItem => !!x);
        if (items.length === 0) return null;

        return (
          <PremiumGlass key={g.id} variant="subtle">
            <div className="p-5 md:p-6">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Museum
                  </div>
                  <h3 className="mt-1 font-display text-xl tracking-tight">{g.title}</h3>
                  <p className="text-xs text-muted-foreground">{g.subtitle}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((m: UIMediaItem) => (
                  <Link
                    key={m!.id}
                    to="/app/media/$id"
                    params={{ id: m!.id }}
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl"
                  >
                    <img
                      src={m!.poster}
                      alt={m!.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute inset-x-2 bottom-2">
                      <div className="truncate text-[12px] font-medium">{m!.title}</div>
                      <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {m!.year}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </PremiumGlass>
        );
      })}
    </div>
  );
}



