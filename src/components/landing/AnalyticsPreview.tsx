import { motion } from "motion/react";
import { lazy, Suspense } from "react";
import type { RechartsComponent } from "@/lib/types/collection";

const Area = lazy(() =>
  import("recharts").then((m) => ({ default: m.Area as unknown as RechartsComponent })),
);
const AreaChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.AreaChart as unknown as RechartsComponent })),
);
const Cell = lazy(() =>
  import("recharts").then((m) => ({ default: m.Cell as unknown as RechartsComponent })),
);
const Pie = lazy(() =>
  import("recharts").then((m) => ({ default: m.Pie as unknown as RechartsComponent })),
);
const PieChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.PieChart as unknown as RechartsComponent })),
);
const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({
    default: m.ResponsiveContainer as unknown as RechartsComponent,
  })),
);
const Bar = lazy(() =>
  import("recharts").then((m) => ({ default: m.Bar as unknown as RechartsComponent })),
);
const BarChart = lazy(() =>
  import("recharts").then((m) => ({ default: m.BarChart as unknown as RechartsComponent })),
);
import { useReducedMotion } from "motion/react";
import { CountUp } from "./CountUp";

const DEMO_STATS = { totalHours: 124, streak: 12, completed: 34 };
const DEMO_ACTIVITY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
  hours: Math.max(0, 1 + Math.sin(i / 2) * 2 + Math.random() * 2),
}));

const GENRE = [
  { name: "Sci-Fi", value: 32 },
  { name: "Drama", value: 24 },
  { name: "Anime", value: 18 },
  { name: "RPG", value: 14 },
  { name: "Other", value: 12 },
];
const COLORS = [
  "var(--primary)",
  "oklch(0.7 0.2 295)",
  "oklch(0.78 0.18 50)",
  "oklch(0.72 0.16 80)",
  "oklch(0.55 0.05 270)",
];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  m: i,
  v: 8 + Math.sin(i / 2) * 6 + (i % 3) * 3,
}));

const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function AnalyticsPreview() {
  const reduced = useReducedMotion();
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 min-h-[400px] animate-pulse bg-white/5 rounded-3xl" />
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glass-elevated relative col-span-1 overflow-hidden rounded-3xl p-6 md:col-span-2"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Watch time · last 30 days
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="font-display text-4xl">
              <CountUp to={DEMO_STATS.totalHours} />
              <span className="ml-1 text-base text-muted-foreground">hrs</span>
            </div>
            <div className="text-xs text-success">+ 14% vs last month</div>
          </div>
          <div className="mt-4 h-40 w-full">
            <ResponsiveContainer>
              <AreaChart data={DEMO_ACTIVITY}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="oklch(0.85 0.12 250)"
                  strokeWidth={2}
                  fill="url(#g1)"
                  isAnimationActive={!reduced}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-elevated relative overflow-hidden rounded-3xl p-6"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Streak
          </div>
          <div className="mt-1 font-display text-4xl">
            <CountUp to={DEMO_STATS.streak} />
            <span className="ml-1 text-base text-muted-foreground">days</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => {
              // Deterministic pseudo-noise so SSR + client agree (no Math.random in render).
              const noise = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
              const intensity = Math.max(0, Math.sin(i / 2) * 0.6 + noise * 0.4);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.01, duration: 0.4 }}
                  className="aspect-square rounded-[5px]"
                  style={{ background: `oklch(0.72 0.18 255 / ${0.08 + intensity * 0.55})` }}
                />
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass-elevated relative flex items-center gap-4 overflow-hidden rounded-3xl p-6"
        >
          <div className="relative h-32 w-32 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={GENRE}
                  dataKey="value"
                  innerRadius={36}
                  outerRadius={56}
                  stroke="none"
                  isAnimationActive={!reduced}
                >
                  {GENRE.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Genres
            </div>
            <ul className="mt-2 space-y-1.5 text-xs">
              {GENRE.map((g, i) => (
                <li key={g.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-foreground">{g.name}</span>
                  <span className="ml-auto text-muted-foreground">{g.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-elevated col-span-1 overflow-hidden rounded-3xl p-6 md:col-span-2"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Monthly completions
          </div>
          <div className="mt-1 font-display text-2xl">
            <CountUp to={DEMO_STATS.completed} /> finished
          </div>
          <div className="mt-4 h-28 w-full">
            <ResponsiveContainer>
              <BarChart data={MONTHS}>
                <Bar
                  dataKey="v"
                  radius={[6, 6, 0, 0]}
                  fill="oklch(0.7 0.2 295)"
                  isAnimationActive={!reduced}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Suspense>
  );
}
