import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function SimilarMemories({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Similar Memories
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Stories that feel alike</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Based on your experience with {item.title}, here are other stories that share a similar
        emotional fingerprint.
      </p>
    </PremiumGlass>
  );
}
