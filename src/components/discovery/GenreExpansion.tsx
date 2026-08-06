import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { lazy, type ComponentType } from "react";
import { useIntelligence } from "@/hooks/use-analytics";
import { ArrowRight, Compass } from "lucide-react";

const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const PolarAngleAxis = lazy(() => import("recharts").then((m) => ({ default: m.PolarAngleAxis as unknown as ComponentType<any> })));
const PolarGrid = lazy(() => import("recharts").then((m) => ({ default: m.PolarGrid as unknown as ComponentType<any> })));
const Radar = lazy(() => import("recharts").then((m) => ({ default: m.Radar as unknown as ComponentType<any> })));
const RadarChart = lazy(() => import("recharts").then((m) => ({ default: m.RadarChart as unknown as ComponentType<any> })));

interface Props {
  data?: any;
}

export function GenreExpansion(_props: Props) {
  const { data: intelligence } = useIntelligence();
  const genres = intelligence?.tasteProfile?.favoriteGenres ?? [];
  const chartData = genres.map((g: any) => ({
    genre: g.name,
    count: g.count,
    fullMark: Math.max(...genres.map((x: any) => x.count)) * 1.2,
  }));

  if (chartData.length === 0) return null;

  return (
    <PremiumGlass className="overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">
            <Compass size={16} />
            Genre Expansion
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            These genres define your collection. The radar shows how your library spans across different categories.
          </p>
          <button className="self-start rounded-full bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
            Explore recommendations <ArrowRight size={14} className="inline ml-1" />
          </button>
        </div>

        <div className="h-64 w-full md:w-80">
          <ResponsiveContainer>
            <RadarChart data={chartData}>
              <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
              <PolarAngleAxis dataKey="genre" tick={{ fontSize: 10, fill: "oklch(1 0 0 / 0.5)" }} />
              <Radar name="Genres" dataKey="count" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PremiumGlass>
  );
}
