import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function SessionHistory({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Session History
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Your sessions with {item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        A timeline of when you engaged with this story — sessions, breaks, and the rhythm of your
        experience.
      </p>
    </PremiumGlass>
  );
}
