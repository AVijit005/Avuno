import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy, type ComponentType } from "react";
const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const AreaChart = lazy(() => import("recharts").then((m) => ({ default: m.AreaChart as unknown as ComponentType<any> })));
const Area = lazy(() => import("recharts").then((m) => ({ default: m.Area as unknown as ComponentType<any> })));
const XAxis = lazy(() => import("recharts").then((m) => ({ default: m.XAxis as unknown as ComponentType<any> })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip as unknown as ComponentType<any> })));

import { TrendingUp } from "lucide-react";

export function MediaEvolution(props: any) {
  const data = [
    { year: "2019", SciFi: 20, Drama: 80, Action: 40 },
    { year: "2020", SciFi: 45, Drama: 60, Action: 50 },
    { year: "2021", SciFi: 70, Drama: 40, Action: 30 },
    { year: "2022", SciFi: 85, Drama: 35, Action: 60 },
    { year: "2023", SciFi: 60, Drama: 50, Action: 80 },
    { year: "2024", SciFi: 90, Drama: 40, Action: 70 },
  ];

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
              <linearGradient id="colorSciFi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDrama" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.78 0.16 50)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="oklch(0.78 0.16 50)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              itemStyle={{ fontSize: 13 }}
            />
            <Area type="monotone" dataKey="SciFi" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSciFi)" />
            <Area type="monotone" dataKey="Drama" stroke="oklch(0.78 0.16 50)" fillOpacity={1} fill="url(#colorDrama)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PremiumGlass>
  );
}

