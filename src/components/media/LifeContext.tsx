import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function LifeContext({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Life Context
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">
        Where {item.title} fits in your life
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Every story arrives at a moment. See how this one connected to what was happening in your
        world.
      </p>
    </PremiumGlass>
  );
}
