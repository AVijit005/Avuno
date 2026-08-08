import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function ThisWeekHistory() {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">This Week</div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Your week in stories</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A snapshot of what you have been watching, reading, and playing this week.
      </p>
    </PremiumGlass>
  );
}
