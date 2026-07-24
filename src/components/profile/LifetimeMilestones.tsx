import { PremiumGlass } from "@/components/ui/PremiumGlass";

const MILESTONES = [
  { when: "2021", label: "Created your Chronicle" },
  { when: "2022", label: "First 100 completed stories" },
  { when: "2023", label: "First long-form collection" },
  { when: "2024", label: "365 journal entries milestone" },
  { when: "2025", label: "1,000 hours lived in stories" },
  { when: "2026", label: "47-day streak — your longest yet" },
];

export function LifetimeMilestones() {
  return (
    <PremiumGlass variant="subtle">
      <div className="p-5 md:p-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Lifetime milestones
        </div>
        <ol className="mt-4 space-y-3">
          {MILESTONES.map((m) => (
            <li
              key={m.when}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-l-2 border-primary/30 pl-3"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {m.when}
              </span>
              <span className="text-sm">{m.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </PremiumGlass>
  );
}
