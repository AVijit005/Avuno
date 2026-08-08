import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function FavoriteMoments({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Favorite Moments
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">
        The scenes you keep coming back to
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        From {item.title} — the moments that replay in your mind long after the credits roll.
      </p>
    </PremiumGlass>
  );
}
