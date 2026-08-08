import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function FranchiseTimeline({
  events,
}: {
  events: { id: string; label: string; when: string }[];
}) {
  if (!events.length) return null;
  return (
    <PremiumGlass variant="subtle">
      <div className="p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Timeline
        </div>
        <ol className="mt-4 space-y-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 border-l-2 border-primary/30 pl-3"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {e.when}
              </span>
              <span className="text-sm">{e.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </PremiumGlass>
  );
}
