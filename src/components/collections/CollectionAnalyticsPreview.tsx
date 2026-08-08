import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { lazy } from "react";
import type { RechartsComponent } from "@/lib/types/collection";
import { useCollectionStats } from "@/hooks/use-collections";
import { CountUp } from "@/components/landing/CountUp";
import { Activity, Clock } from "lucide-react";
import type { CollectionStats } from "@/lib/types/collection";

const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({
    default: m.ResponsiveContainer as unknown as RechartsComponent,
  })),
);
const BarChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.BarChart as unknown as RechartsComponent })),
);
const Bar = lazy(() =>
  import("recharts").then((m) => ({ default: m.Bar as unknown as RechartsComponent })),
);
const Cell = lazy(() =>
  import("recharts").then((m) => ({ default: m.Cell as unknown as RechartsComponent })),
);
const Tooltip = lazy(() =>
  import("recharts").then((m) => ({ default: m.Tooltip as unknown as RechartsComponent })),
);

interface Props {
  collection: {
    id: string;
    name: string;
    itemCount?: number;
  };
}

export function CollectionAnalyticsPreview({ collection }: Props) {
  const { data: statsData } = useCollectionStats(collection.id);
  const stats: CollectionStats | null | undefined = statsData;
  const weeklyActivity = stats?.weeklyActivity ?? [];

  return (
    <PremiumGlass className="p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-lg font-medium tracking-tight">Analytics Preview</h4>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
          <Activity size={16} className="text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Items
          </div>
          <div className="mt-1 font-display text-2xl font-medium tracking-tight">
            <CountUp to={stats?.itemCount ?? stats?.totalItems ?? collection.itemCount ?? 0} />
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Time Spent
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-display text-2xl font-medium tracking-tight">
            <CountUp to={stats?.totalHours ?? 0} />
            <span className="text-sm text-muted-foreground">hrs</span>
          </div>
        </div>
      </div>

      {weeklyActivity.length > 0 && (
        <div className="h-32 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {weeklyActivity.map((_entry, index: number) => (
                  <Cell key={`cell-${index}`} fill="var(--primary)" fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </PremiumGlass>
  );
}
