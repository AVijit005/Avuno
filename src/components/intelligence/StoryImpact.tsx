import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  mediaId: string;
}

export function StoryImpact({ mediaId }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Story Impact
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">How this story changed things</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The ripple effect — how this story influenced your tastes, conversations, and the way you
        see the world.
      </p>
    </PremiumGlass>
  );
}
