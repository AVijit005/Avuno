import { createFileRoute } from "@tanstack/react-router";
import { StatusPageShell } from "@/components/library/StatusPageShell";
import { PlanningRow } from "@/components/library/PlanningRow";
import { planning } from "@/lib/library";
import type { UIMediaItem } from "@/lib/adapters/types";

export const Route = createFileRoute("/app/library/planning")({
  component: PlanningPage,
});

function PlanningPage() {
  const items = planning();
  return (
    <StatusPageShell
      status="planning"
      title="Future Adventures"
      description="Worlds you've promised yourself."
      count={items.length}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((m) => (
          <PlanningRow key={m.id} item={m as UIMediaItem} />
        ))}
      </div>
    </StatusPageShell>
  );
}
