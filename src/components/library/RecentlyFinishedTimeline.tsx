import { Link } from "@tanstack/react-router";
import { Star, NotebookPen } from "lucide-react";
import type { MediaItem } from "@/lib/types";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { bucketOfDate, metaOf, recentlyFinished } from "@/lib/library";

const BUCKETS = ["Today", "Yesterday", "Last Week", "Last Month", "Older"] as const;

export function RecentlyFinishedTimeline({ limit }: { limit?: number }) {
  const all = recentlyFinished().slice(0, limit ?? 24);
  const groups: Record<string, MediaItem[]> = {
    Today: [],
    Yesterday: [],
    "Last Week": [],
    "Last Month": [],
    Older: [],
  };
  all.forEach((m) => {
    const b = bucketOfDate(metaOf(m.id).completedAt);
    groups[b].push(m);
  });

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
      />
      <div className="space-y-8">
        {BUCKETS.map((b) =>
          groups[b].length === 0 ? null : (
            <div key={b}>
              <div className="mb-3 flex items-center gap-3 pl-8">
                <span className="absolute left-[6px] h-3 w-3 -translate-y-0.5 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_10px_oklch(0.72_0.18_255/0.25)]" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-primary/90">{b}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 pl-8 md:grid-cols-2">
                {groups[b].map((m) => {
                  const meta = metaOf(m.id);
                  return (
                    <Link key={m.id} to="/app/media/$id" params={{ id: m.id }} className="block">
                      <PremiumGlass interactive className="flex items-center gap-3 rounded-2xl p-3">
                        <img
                          src={m.poster || undefined}
                          alt={m.title}
                          className="h-16 w-12 shrink-0 rounded-md object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{m.title}</div>
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {meta.completedAt ?? "Recently"} · {m.kind}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                              {(m.rating ?? 0).toFixed(1)}
                            </span>
                            {meta.journalExcerpt && (
                              <span className="inline-flex items-center gap-1 text-primary/80">
                                <NotebookPen className="h-3 w-3" /> journaled
                              </span>
                            )}
                          </div>
                        </div>
                      </PremiumGlass>
                    </Link>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
