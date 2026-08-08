import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function MediaDNA() {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Media DNA</div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Your media fingerprint</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The unique pattern of your media consumption — genre affinities, emotional range, and the
        stories that define you.
      </p>
    </PremiumGlass>
  );
}
