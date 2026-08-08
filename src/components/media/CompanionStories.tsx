import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function CompanionStories({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Companion Stories
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Stories that go together</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {item.title} pairs well with these other stories — whether as a double feature or a thematic
        companion.
      </p>
    </PremiumGlass>
  );
}
