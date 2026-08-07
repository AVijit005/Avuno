import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy } from "react";
import type { RechartsComponent } from "@/lib/types/collection";
import { useIntelligence } from "@/hooks/use-analytics";
import { Dna, Loader2 } from "lucide-react";
import type { ImpactItem } from "@/lib/types/intelligence";

const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as RechartsComponent })));
const PolarAngleAxis = lazy(() => import("recharts").then((m) => ({ default: m.PolarAngleAxis as unknown as RechartsComponent })));
const PolarGrid = lazy(() => import("recharts").then((m) => ({ default: m.PolarGrid as unknown as RechartsComponent })));
const Radar = lazy(() => import("recharts").then((m) => ({ default: m.Radar as unknown as RechartsComponent })));
const RadarChart = lazy(() => import("recharts").then((m) => ({ default: m.RadarChart as unknown as RechartsComponent })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip as unknown as RechartsComponent })));

export function MemoryDNA() {
  const { data: intelligence, isLoading } = useIntelligence();
  const rawImpact = intelligence?.impactSummary ?? [];
  const data = rawImpact.map((i: ImpactItem) => ({
    trait: i.label,
    value: i.value,
    fullMark: 100,
  }));

  if (isLoading) {
    return (
      <PremiumGlass className="p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </PremiumGlass>
    );
  }

  if (data.length === 0) {
    return (
      <PremiumGlass className="p-6 h-[400px] flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
            <Dna size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl tracking-tight">Memory DNA</h3>
            <p className="text-xs text-muted-foreground">Add journal entries to reveal your profile</p>
          </div>
        </div>
      </PremiumGlass>
    );
  }

  return (
    <PremiumGlass className="p-6 h-[400px] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
          <Dna size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-tight">Memory DNA</h3>
          <p className="text-xs text-muted-foreground">The emotional makeup of your journal</p>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
            <PolarAngleAxis dataKey="trait" tick={{ fontSize: 10, fill: "oklch(1 0 0 / 0.5)" }} />
            <Radar name="Profile" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </PremiumGlass>
  );
}
