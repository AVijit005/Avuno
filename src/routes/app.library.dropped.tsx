import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { dropped, metaOf } from "@/lib/library";
import { useLibraryStore } from "@/lib/store/libraryStore";
import { EmptyState } from "@/components/ui/EmptyState";

export const Route = createFileRoute("/app/library/dropped")({
  component: DroppedPage,
});

function DroppedPage() {
  const items = dropped();
  const setStatus = useLibraryStore((s) => s.setStatus);
  return (
    <StatusPageShell
      status="dropped"
      title="Stories Left Behind"
      description="It wasn't the right one. That's a kind of memory too."
      count={items.length}
    >
      {items.length === 0 ? (
        <EmptyState
          title="Nothing left behind"
          description="You haven't dropped any stories yet."
        />
      ) : (
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
                  <div
                    className="mt-0.5 text-[11px]"
                    style={{
                      color: "color-mix(in oklab, var(--status-dropped) 80%, oklch(0.97 0 0))",
                    }}
                  >
                    {meta.droppedAtLabel ?? "Dropped"}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {m.year} · {m.kind}
                  </div>
                </div>
                <button
                  onClick={() => setStatus(m.id, "in_progress")}
                  className="press-scale glass-subtle inline-flex shrink-0 items-center justify-center gap-1 rounded-full min-h-[44px] px-4 text-[13px] font-medium text-muted-foreground hover:text-foreground focus-ring"
                >
                  <RotateCcw className="h-4 w-4" /> Restart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </StatusPageShell>
  );
}
