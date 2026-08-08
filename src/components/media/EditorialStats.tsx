import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function EditorialStats({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Editorial Stats
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">The numbers behind {item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A deeper look at how this story fits into your broader media landscape.
      </p>
    </PremiumGlass>
  );
}
