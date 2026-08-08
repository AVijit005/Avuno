import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Archive as ArchiveIcon } from "lucide-react";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { paused, metaOf } from "@/lib/library";
import { useLibraryStore } from "@/lib/store/libraryStore";

export const Route = createFileRoute("/app/library/paused")({
  component: PausedPage,
});

function PausedPage() {
  const items = paused();
  return (
    <StatusPageShell
      status="paused"
      title="Waiting For The Right Time"
      description="Stories you'll come back to when you're ready."
      count={items.length}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((m) => {
          const meta = metaOf(m.id);
          return (
            <div key={m.id} className="glass flex items-center gap-4 rounded-2xl p-3">
              <img
                src={m.poster || undefined}
                alt={m.title}
                className="h-20 w-14 shrink-0 rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {meta.droppedAtLabel ?? `Paused at ${m.progress ?? 0}%`}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Last opened {meta.lastActivityAt ?? "recently"}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${m.progress ?? 0}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <Link
                  to="/app/media/$id"
                  params={{ id: m.id }}
                  className="press-scale inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[11px] text-primary-foreground"
                >
                  <Play className="h-3 w-3 fill-current" /> Resume
                </Link>
                <button
                  className="press-scale glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => useLibraryStore.getState().setStatus(m.id, "archived")}
                >
                  <ArchiveIcon className="h-3 w-3" /> Archive
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </StatusPageShell>
  );
}
