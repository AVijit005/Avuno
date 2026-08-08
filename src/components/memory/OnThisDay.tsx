import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function OnThisDay() {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        On This Day
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">What happened on this day</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A look back at what you were watching, reading, or playing on this day in previous years.
      </p>
    </PremiumGlass>
  );
}
