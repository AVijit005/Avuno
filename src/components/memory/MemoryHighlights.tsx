import { useLibrary } from "@/hooks/use-library";
import { Link } from "@tanstack/react-router";
import { HIGHLIGHTS } from "@/lib/memoryInsights";
import { cn } from "@/lib/utils";
import { adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  className?: string;
}

export function MemoryHighlights({ className }: Props) {
  const { data: libraryData } = useLibrary({ limit: 100 });
  const MEDIA: UIMediaItem[] = libraryData?.pages.flatMap((p) => p.data.map(adaptLibraryItem)) || [];
  return (
    <section aria-label="Memory highlights" className={cn("space-y-5", className)}>
      <header className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl tracking-tight">Highlights</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          From everything you've remembered
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map((h) => {
          const m = MEDIA.find((x) => x.id === h.mediaId);
          if (!m) return null;
          return (
            <li key={h.id}>
              <Link
                to="/app/media/$id"
                params={{ id: m.id }}
                className="glass group flex gap-3 rounded-2xl p-3 transition hover:bg-white/[0.04]"
              >
                <img
                  src={m.poster}
                  alt={h.title}
                  className="h-20 w-14 flex-none rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {h.label}
                  </div>
                  <div className="mt-0.5 truncate font-display text-base tracking-tight">
                    {m.title}
                  </div>
                  <div className="mt-0.5 text-[11px] italic text-muted-foreground line-clamp-2">
                    {h.caption}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
