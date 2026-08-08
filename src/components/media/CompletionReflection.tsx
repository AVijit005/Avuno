import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function CompletionReflection({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Completion Reflection
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">How it ended for you</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The final thoughts on {item.title} — what stayed, what faded, and what you would tell
        someone just starting.
      </p>
    </PremiumGlass>
  );
}
