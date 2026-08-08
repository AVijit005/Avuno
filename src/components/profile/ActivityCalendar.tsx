import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { useActivity } from "@/hooks/use-analytics";

export function ActivityCalendar() {
  const { data: activity } = useActivity();

  const cols = 30;
  // If we have heatmap, we just take the last 30 or generate 30.
  // The heatmap is an array of { date, count }.
  const heatmap = activity?.heatmap || [];

  // Pad or slice to 30 days
  const recent30 = heatmap.slice(-30);
  while (recent30.length < 30) {
    recent30.unshift({ date: `empty-${recent30.length}`, count: 0 });
  }

  const max = Math.max(1, ...recent30.map((a) => a.count));

  return (
    <PremiumGlass variant="subtle">
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Activity (last 30 days)
        </div>
        <div
          className="mt-4 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {recent30.map((a, i) => {
            const alpha = 0.1 + (a.count / max) * 0.75;
            return (
              <div
                key={a.date || i}
                title={`Count: ${a.count}`}
                className="aspect-square rounded-[4px]"
                style={{ background: `oklch(0.72 0.18 255 / ${alpha})` }}
              />
            );
          })}
        </div>
      </div>
    </PremiumGlass>
  );
}
