import { PremiumGlass } from "@/components/ui/PremiumGlass";
import type { UIMediaItem } from "@/lib/adapters/types";

interface Props {
  item: UIMediaItem;
}

export function DiscussionNotes({ item }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Discussion Notes
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Talking points for {item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Key themes, questions, and ideas to discuss with friends who have also experienced this
        story.
      </p>
    </PremiumGlass>
  );
}
