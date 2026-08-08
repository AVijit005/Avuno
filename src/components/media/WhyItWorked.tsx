import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function WhyItWorked({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Reflection
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Why {item.title} resonated</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Some stories click because of timing, theme, or pure craft. Explore what made this one work
        for you.
      </p>
    </PremiumGlass>
  );
}
