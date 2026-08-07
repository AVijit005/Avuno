import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute } from "@tanstack/react-router";
import { MediaCard } from "@/components/media/MediaCard";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { inProgress } from "@/lib/library";

export const Route = createFileRoute("/app/library/in-progress")({
  component: InProgressPage,
});

function InProgressPage() {
  const items = inProgress();
  return (
    <StatusPageShell
      status="in_progress"
      title="Right in the middle"
      description="Stories actively woven into your week."
      count={items.length}
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((m) => (
          <MediaCard key={m.id} item={m as UIMediaItem} />
        ))}
      </div>
    </StatusPageShell>
  );
}
