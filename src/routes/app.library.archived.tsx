import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute } from "@tanstack/react-router";
import { MediaCard } from "@/components/media/MediaCard";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { archived } from "@/lib/library";

export const Route = createFileRoute("/app/library/archived")({
  component: ArchivedPage,
});

function ArchivedPage() {
  const items = archived();
  return (
    <StatusPageShell
      status="archived"
      title="Quietly Archived"
      description="Stories tucked away from view — still part of your record."
      count={items.length}
    >
      {items.length === 0 ? (
        <div className="glass-subtle rounded-3xl p-10 text-center text-sm text-muted-foreground">
          Nothing archived yet. Move anything here to keep your active library focused.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 opacity-90">
          {items.map((m) => (
            <MediaCard key={m.id} item={m as UIMediaItem} />
          ))}
        </div>
      )}
    </StatusPageShell>
  );
}
