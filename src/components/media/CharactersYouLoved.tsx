import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function CharactersYouLoved({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Characters
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">The people who stayed with you</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Every great story has characters that become part of your world. These are the ones from{" "}
        {item.title} that you carry forward.
      </p>
    </PremiumGlass>
  );
}
