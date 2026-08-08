import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy } from "react";
import type { RechartsComponent } from "@/lib/types/collection";
import { useIntelligence } from "@/hooks/use-analytics";
import { TrendingUp, Loader2 } from "lucide-react";
import type { EvolutionItem } from "@/lib/types/intelligence";

const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({
    default: m.ResponsiveContainer as unknown as RechartsComponent,
  })),
);
const AreaChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.AreaChart as unknown as RechartsComponent })),
);
const Area = lazy(() =>
  import("recharts").then((m) => ({ default: m.Area as unknown as RechartsComponent })),
);
const XAxis = lazy(() =>
  import("recharts").then((m) => ({ default: m.XAxis as unknown as RechartsComponent })),
);
const Tooltip = lazy(() =>
  import("recharts").then((m) => ({ default: m.Tooltip as unknown as RechartsComponent })),
);

export function MediaEvolution() {
  const { data: intelligence, isLoading } = useIntelligence();
  const rawData = intelligence?.mediaEvolution ?? [];
  const data = rawData.map((d: EvolutionItem) => ({
    year: d.year ?? d.focus ?? "",
    Media: d.mediaCount ?? 0,
    Hours: d.hoursSpent ?? 0,
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
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl tracking-tight">Media Evolution</h3>
            <p className="text-xs text-muted-foreground">Keep tracking to see your journey</p>
          </div>
        </div>
      </PremiumGlass>
    );
  }

  return (
    <PremiumGlass className="p-6 h-[400px] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-tight">Media Evolution</h3>
          <p className="text-xs text-muted-foreground">How your tastes have changed over time</p>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "oklch(1 0 0 / 0.4)" }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.15 0 0 / 0.95)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="Media"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#colorMedia)"
              dot={{ r: 3, fill: "var(--primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PremiumGlass>
  );
}
