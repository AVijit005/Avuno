import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute } from "@tanstack/react-router";
import { ContinueCard } from "@/components/library/ContinueCard";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { continueJourney } from "@/lib/library";

export const Route = createFileRoute("/app/library/continue")({
  component: ContinueJourneyPage,
});

function ContinueJourneyPage() {
  const items = continueJourney();
  return (
    <StatusPageShell
      status="in_progress"
      title="Continue Your Journey"
      description="Stories you're still living — paused, never lost."
      count={items.length}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((m) => (
          <ContinueCard key={m.id} item={m as UIMediaItem} />
        ))}
      </div>
    </StatusPageShell>
  );
}
