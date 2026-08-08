import { PremiumGlass } from "@/components/ui/PremiumGlass";

export function MemoryCapsules() {
  return (
    <PremiumGlass variant="subtle" className="p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Memory Capsules
      </div>
      <h3 className="mt-1 font-display text-xl tracking-tight">Snapshots in time</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Time capsules of your media journey — moments folded into single feelings, opened when you
        need them.
      </p>
    </PremiumGlass>
  );
}
