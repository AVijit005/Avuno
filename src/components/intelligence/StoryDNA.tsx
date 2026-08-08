import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  mediaId: string;
}

export function StoryDNA({ mediaId }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Story DNA</div>
      <h3 className="mt-1 font-display text-xl tracking-tight">The genetic makeup of this story</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Analyze the narrative building blocks — genre markers, tonal shifts, and thematic patterns
        that define this story.
      </p>
    </PremiumGlass>
  );
}
