import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function RememberAgain() {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Remember Again
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Stories worth revisiting</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Based on your history, these are the stories that deserve another look — because the second
        time hits different.
      </p>
    </PremiumGlass>
  );
}
