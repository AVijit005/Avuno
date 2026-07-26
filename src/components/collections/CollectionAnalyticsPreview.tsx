import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { motion } from "motion/react";
import { lazy, type ComponentType } from "react";
const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const BarChart = lazy(() => import("recharts").then((m) => ({ default: m.BarChart as unknown as ComponentType<any> })));
const Bar = lazy(() => import("recharts").then((m) => ({ default: m.Bar as unknown as ComponentType<any> })));
const Cell = lazy(() => import("recharts").then((m) => ({ default: m.Cell as unknown as ComponentType<any> })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip as unknown as ComponentType<any> })));

import { CountUp } from "@/components/landing/CountUp";
import { Activity, Clock } from "lucide-react";

interface Props {
  collection: any;
}

export function CollectionAnalyticsPreview({ collection }: Props) {
  const data = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 15 },
    { name: "Thu", value: 25 },
    { name: "Fri", value: 22 },
    { name: "Sat", value: 30 },
    { name: "Sun", value: 28 },
  ];

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
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Views</div>
          <div className="mt-1 font-display text-2xl font-medium tracking-tight">
            <CountUp to={1284} />
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Time Spent</div>
          <div className="mt-1 flex items-baseline gap-1 font-display text-2xl font-medium tracking-tight">
            <CountUp to={42} />
            <span className="text-sm text-muted-foreground">hrs</span>
          </div>
        </div>
      </div>

      <div className="h-32 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="var(--primary)" fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PremiumGlass>
  );
}

