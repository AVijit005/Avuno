import { motion } from "motion/react";
import { Film, BookOpen, Gamepad2, Music2, Target, Flame, Sparkles } from "lucide-react";
import { lazy } from "react";
import type { RechartsComponent } from "@/lib/types/collection";
import { useOverview, useStreaks } from "@/hooks/use-analytics";
import { CountUp } from "@/components/landing/CountUp";

const Area = lazy(() =>
  import("recharts").then((m) => ({ default: m.Area as unknown as RechartsComponent })),
);
const AreaChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.AreaChart as unknown as RechartsComponent })),
);
const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({
    default: m.ResponsiveContainer as unknown as RechartsComponent,
  })),
);

type Item = {
  key: string;
  icon: typeof Film;
  label: string;
  color: string;
  value?: number;
  suffix?: string;
  text?: string;
};

function spark(seed: number) {
  return Array.from({ length: 14 }, (_, i) => ({
    v: 1 + Math.abs(Math.sin(i / 2 + seed)) * 3 + Math.abs(Math.cos(i * 0.7 + seed)),
  }));
}

export function ThisWeek() {
  const { data: overview } = useOverview();
  const { data: streaks } = useStreaks();

  const ITEMS: Item[] = [
    {
      key: "watch",
      icon: Film,
      label: "Watch time",
      value: overview?.hoursWatched ?? 0,
      suffix: "h",
      color: "var(--primary)",
    },
    {
      key: "read",
      icon: BookOpen,
      label: "Reading",
      value: overview?.hoursRead ?? 0,
      suffix: "h",
      color: "oklch(0.62 0.2 295)",
    },
    {
      key: "game",
      icon: Gamepad2,
      label: "Gaming",
      value: overview?.hoursPlayed ?? 0,
      suffix: "h",
      color: "oklch(0.72 0.16 80)",
    },
    {
      key: "listen",
      icon: Music2,
      label: "Listening",
      value: overview?.hoursLearned ?? 0,
      suffix: "h",
      color: "oklch(0.7 0.18 25)",
    },
    {
      key: "rate",
      icon: Target,
      label: "Completion",
      value: overview?.averageRating ?? 0,
      suffix: " avg",
      color: "oklch(0.72 0.16 160)",
    },
    {
      key: "streak",
      icon: Flame,
      label: "Streak",
      value: streaks?.currentStreak ?? 0,
      suffix: " d",
      color: "oklch(0.78 0.16 50)",
    },
    {
      key: "genre",
      icon: Sparkles,
      label: "Top genre",
      text: overview?.favoriteGenre ?? "—",
      color: "oklch(0.65 0.22 295)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
      {ITEMS.map((it, i) => (
        <motion.div
          key={it.key}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden rounded-2xl p-4"
        >
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-50 blur-2xl"
            style={{ background: it.color }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <it.icon className="h-3 w-3" /> {it.label}
            </div>
            <div className="mt-2 font-display text-2xl tracking-tight">
              {it.text ? (
                <span>{it.text}</span>
              ) : (
                <>
                  <CountUp to={it.value ?? 0} decimals={(it.value ?? 0) % 1 !== 0 ? 1 : 0} />
                  {it.suffix}
                </>
              )}
            </div>
            <div className="mt-2 h-8">
              <ResponsiveContainer>
                <AreaChart data={spark(i)}>
                  <defs>
                    <linearGradient id={`spark-${it.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={it.color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={it.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={it.color}
                    strokeWidth={1.4}
                    fill={`url(#spark-${it.key})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
