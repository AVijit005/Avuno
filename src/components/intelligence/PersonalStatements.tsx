import { PremiumGlass } from "@/components/ui/PremiumGlass";

interface Props {
  mediaId: string;
}

export function PersonalStatements({ mediaId }: Props) {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Personal Statements
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">
        What you would say about this story
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your personal take — the elevator pitch, the one-liner, the thing you would tell a friend.
      </p>
    </PremiumGlass>
  );
}
