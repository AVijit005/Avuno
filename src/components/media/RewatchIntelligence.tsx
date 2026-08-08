import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function RewatchIntelligence({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Rewatch Intelligence
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Should you revisit {item.title}?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Based on your viewing patterns and the passage of time, here is when this story might hit
        differently.
      </p>
    </PremiumGlass>
  );
}
