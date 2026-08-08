import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function StoryJourney({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Story Journey
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Your path through {item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This story has been part of your life since you first discovered it. The journey continues.
      </p>
    </PremiumGlass>
  );
}
