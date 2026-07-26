import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy, type ComponentType } from "react";
const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const PolarAngleAxis = lazy(() => import("recharts").then((m) => ({ default: m.PolarAngleAxis as unknown as ComponentType<any> })));
const PolarGrid = lazy(() => import("recharts").then((m) => ({ default: m.PolarGrid as unknown as ComponentType<any> })));
const Radar = lazy(() => import("recharts").then((m) => ({ default: m.Radar as unknown as ComponentType<any> })));
const RadarChart = lazy(() => import("recharts").then((m) => ({ default: m.RadarChart as unknown as ComponentType<any> })));

import { ArrowRight, Compass } from "lucide-react";

interface Props {
  data?: any;
}

export function GenreExpansion({ data }: Props) {
  const chartData = [
    { genre: "Sci-Fi", A: 120, B: 110, fullMark: 150 },
    { genre: "Fantasy", A: 98, B: 130, fullMark: 150 },
    { genre: "Thriller", A: 86, B: 130, fullMark: 150 },
    { genre: "Drama", A: 99, B: 100, fullMark: 150 },
    { genre: "Comedy", A: 85, B: 90, fullMark: 150 },
    { genre: "Action", A: 65, B: 85, fullMark: 150 },
  ];

  return (
    <PremiumGlass className="overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        
        <div className="flex-1 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[oklch(0.72_0.18_255)]">
            <Compass size={24} />
          </div>
          <h3 className="font-display text-3xl font-medium tracking-tight">
            Expand Your Horizons
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You watch a lot of <strong className="text-foreground">Sci-Fi</strong> and <strong className="text-foreground">Drama</strong>. 
            Based on your ratings, you might really enjoy stepping into <strong className="text-[oklch(0.72_0.18_255)]">Cyberpunk</strong> or <strong className="text-[oklch(0.72_0.18_255)]">Neo-noir</strong>.
          </p>
          
          <button className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.72_0.18_255)]">
            Explore Neo-noir
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="relative h-64 w-full flex-1 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="genre" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <Radar name="Current Taste" dataKey="A" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.1)" fillOpacity={0.5} />
              <Radar name="Potential Match" dataKey="B" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </PremiumGlass>
  );
}

