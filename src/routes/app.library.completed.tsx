import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosterCard } from "@/components/ui/PosterCard";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { completed, metaOf } from "@/lib/library";
import { cn } from "@/lib/utils";
import type { UIMediaItem } from "@/lib/adapters/types";

import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/library/completed")({
  component: CompletedPage,
});

const SORTS = ["Recent", "Highest Rated", "Most Rewatched"] as const;
type Sort = (typeof SORTS)[number];

function CompletedPage() {
  const [sort, setSort] = useState<Sort>("Recent");
  const items = completed()
    .slice()
    .sort((a, b) => {
      if (sort === "Highest Rated") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sort === "Most Rewatched")
        return (
          ((b as { stats?: { rewatches?: number } }).stats?.rewatches ?? 0) -
          ((a as { stats?: { rewatches?: number } }).stats?.rewatches ?? 0)
        );
      return (
        new Date(metaOf(b.id).completedAt ?? 0).getTime() -
        new Date(metaOf(a.id).completedAt ?? 0).getTime()
      );
    });
  return (
    <StatusPageShell
      status="completed"
      title="Stories That Stayed With You"
      description="Every world you lived to the end."
      count={items.length}
      action={
        <div className="glass-subtle inline-flex rounded-full p-1">
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "press-scale rounded-full px-3 py-1.5 text-[11px]",
                sort === s ? "bg-white/[0.1] text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          illustration={<CheckCircle2 className="h-8 w-8 text-primary" />}
          title="No completed stories yet"
          description="When you finish a movie, book, game, or show, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((m) => (
            <PosterCard key={m.id} item={m as unknown as UIMediaItem} />
          ))}
        </div>
      )}
    </StatusPageShell>
  );
}
