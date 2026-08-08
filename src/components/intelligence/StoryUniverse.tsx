import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  mediaId: string;
}

export function StoryUniverse({ mediaId }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Story Universe
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">The world this story belongs to</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Explore the broader universe — shared worlds, connected narratives, and the larger tapestry
        this story weaves into.
      </p>
    </PremiumGlass>
  );
}
