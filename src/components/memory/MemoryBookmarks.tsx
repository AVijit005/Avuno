import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useLibrary } from "@/hooks/use-library";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { MEMORY_BOOKMARKS } from "@/lib/memoryInsights";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function MemoryBookmarks({ className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  return (
    <section aria-label="Memory bookmarks" className={cn("space-y-5", className)}>
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-tight">Bookmarked memories</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Saved, not favorited
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MEMORY_BOOKMARKS.map((b) => {
          const m = MEDIA.find((x) => x.id === b.mediaId);
          if (!m) return null;
          return (
            <li key={b.id}>
              <PremiumGlass variant="subtle">
                <Link to="/app/media/$id" params={{ id: m.id }} className="flex gap-3 p-4">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white/[0.04] text-primary/85 ring-1 ring-white/10">
                    <Bookmark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-base tracking-tight">{m.title}</div>
                    <p className="mt-0.5 text-[11px] italic text-muted-foreground line-clamp-2">
                      {b.note}
                    </p>
                    <time className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      Saved {b.savedAt}
                    </time>
                  </div>
                </Link>
              </PremiumGlass>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
