import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy, type ComponentType } from "react";
const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const PolarAngleAxis = lazy(() => import("recharts").then((m) => ({ default: m.PolarAngleAxis as unknown as ComponentType<any> })));
const PolarGrid = lazy(() => import("recharts").then((m) => ({ default: m.PolarGrid as unknown as ComponentType<any> })));
const Radar = lazy(() => import("recharts").then((m) => ({ default: m.Radar as unknown as ComponentType<any> })));
const RadarChart = lazy(() => import("recharts").then((m) => ({ default: m.RadarChart as unknown as ComponentType<any> })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip as unknown as ComponentType<any> })));

import { Dna } from "lucide-react";

export function MemoryDNA(props: any) {
  const data = [
    { trait: "Nostalgic", value: 85, fullMark: 100 },
    { trait: "Thrilling", value: 65, fullMark: 100 },
    { trait: "Happy", value: 90, fullMark: 100 },
    { trait: "Melancholic", value: 45, fullMark: 100 },
    { trait: "Inspiring", value: 75, fullMark: 100 },
    { trait: "Comforting", value: 95, fullMark: 100 },
  ];

  return (
    <PremiumGlass className="p-6 h-[400px] flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.72_0.18_255)]">
          <Dna size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl tracking-tight">Memory DNA</h3>
          <p className="text-xs text-muted-foreground">The emotional makeup of your journal</p>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="trait" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              itemStyle={{ color: "var(--primary)" }}
            />
            <Radar name="Intensity" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </PremiumGlass>
  );
}

