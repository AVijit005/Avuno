import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { motion, useReducedMotion } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer as unknown as ComponentType<any> })));
const AreaChart = lazy(() => import("recharts").then((m) => ({ default: m.AreaChart as unknown as ComponentType<any> })));
const Area = lazy(() => import("recharts").then((m) => ({ default: m.Area as unknown as ComponentType<any> })));
const XAxis = lazy(() => import("recharts").then((m) => ({ default: m.XAxis as unknown as ComponentType<any> })));
const YAxis = lazy(() => import("recharts").then((m) => ({ default: m.YAxis as unknown as ComponentType<any> })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip as unknown as ComponentType<any> })));
const PieChart = lazy(() => import("recharts").then((m) => ({ default: m.PieChart as unknown as ComponentType<any> })));
const Pie = lazy(() => import("recharts").then((m) => ({ default: m.Pie as unknown as ComponentType<any> })));
const Cell = lazy(() => import("recharts").then((m) => ({ default: m.Cell as unknown as ComponentType<any> })));
const BarChart = lazy(() => import("recharts").then((m) => ({ default: m.BarChart as unknown as ComponentType<any> })));
const Bar = lazy(() => import("recharts").then((m) => ({ default: m.Bar as unknown as ComponentType<any> })));
const Legend = lazy(() => import("recharts").then((m) => ({ default: m.Legend as unknown as ComponentType<any> })));
import {
  Flame,
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  Music,
  Headphones,
  GraduationCap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Trophy,
  Heart,
  Clock,
  Repeat,
  Pause,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  CountUp,
  SegmentedFilter,
  StatCardPremium,
  ProgressRing,
  GlassTooltip,
  ZoneHeading,
} from "@/components/analytics/AnalyticsKit";
import { ChartStory } from "@/components/analytics/ChartStory";

import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PosterCard } from "@/components/ui/PosterCard";
import {
  useOverview,
  useStreaks,
  useMediaAnalytics,
  useGenreAnalytics,
  useActivity,
  useInsights,
} from "@/hooks/use-analytics";
import {
  adaptOverview,
  adaptStreaks,
  adaptMediaAnalytics,
  adaptGenreAnalytics,
  adaptActivity,
  adaptInsights,
} from "@/lib/adapters/analytics";
import { MemoryInsights } from "@/components/memory/MemoryInsights";
import { LiveStatsStrip } from "@/components/memory/LiveStatsStrip";
import { YourReflectionsRail } from "@/components/memory/YourReflectionsRail";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

const KIND_ICON: Record<string, typeof Film> = {
  Movies: Film,
  Anime: Tv,
  Books: BookOpen,
  Games: Gamepad2,
  Music,
  Podcasts: Headphones,
  Courses: GraduationCap,
  "Hours Watched": Clock,
  "Hours Read": BookOpen,
  "Hours Played": Gamepad2,
  "Hours Listened": Headphones,
};

export default function AnalyticsPage() {
  const reduced = useReducedMotion();
  const [range, setRange] = useState<"lifetime" | "year" | "month" | "week">("year");
  const [scope, setScope] = useState<"all" | "movies" | "anime" | "books" | "games">("all");
  const [todayStr, setTodayStr] = useState("");
  useEffect(() => setTodayStr(new Date().toLocaleDateString()), []);

  const qOverview = useOverview();
  const qStreaks = useStreaks();
  const qMedia = useMediaAnalytics();
  const qGenres = useGenreAnalytics();
  const qActivity = useActivity();
  const qInsights = useInsights();

  const isLoading =
    qOverview.isLoading ||
    qStreaks.isLoading ||
    qMedia.isLoading ||
    qGenres.isLoading ||
    qActivity.isLoading ||
    qInsights.isLoading;

  const isError =
    qOverview.isError ||
    qStreaks.isError ||
    qMedia.isError ||
    qGenres.isError ||
    qActivity.isError ||
    qInsights.isError;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Sparkles className="h-8 w-8 animate-pulse text-primary/50" />
        <p className="animate-pulse text-muted-foreground">Gathering your stories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <p className="text-destructive">Failed to load analytics.</p>
        <PremiumButton
          onClick={() => {
            qOverview.refetch();
            qStreaks.refetch();
            qMedia.refetch();
            qGenres.refetch();
            qActivity.refetch();
            qInsights.refetch();
          }}
          variant="secondary"
        >
          Retry
        </PremiumButton>
      </div>
    );
  }

  const o = qOverview.data ? adaptOverview(qOverview.data) : null;
  const s = qStreaks.data ? adaptStreaks(qStreaks.data) : null;
  const m = qMedia.data ? adaptMediaAnalytics(qMedia.data) : null;
  const g = qGenres.data ? adaptGenreAnalytics(qGenres.data) : null;
  const a = qActivity.data ? adaptActivity(qActivity.data) : null;
  const i = qInsights.data ? adaptInsights(qInsights.data) : null;

  if (!o || !s || !m || !g || !a || !i) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">No analytics data found.</p>
      </div>
    );
  }

  const lifetimeStats = useMemo(() => {
    const stats = [
      { label: "Completed Stories", value: o.completedItems, delta: o.completedItemsDelta ?? null, accent: "oklch(0.72 0.18 255)", scopeKey: "all" },
      { label: "Movies Completed", value: o.moviesCompleted, delta: o.moviesCompletedDelta ?? null, accent: "oklch(0.65 0.22 295)", scopeKey: "movies" },
      { label: "Books Read", value: o.booksRead, delta: o.booksReadDelta ?? null, accent: "oklch(0.7 0.18 25)", scopeKey: "books" },
      { label: "Games Finished", value: o.gamesFinished, delta: o.gamesFinishedDelta ?? null, accent: "oklch(0.82 0.16 80)", scopeKey: "games" },
      { label: "Total Library Items", value: o.totalItems, delta: o.totalItemsDelta ?? null, accent: "oklch(0.72 0.16 160)", scopeKey: "all" },
      { label: "Average Rating", value: o.averageRating ?? 5.0, delta: o.averageRatingDelta ?? null, accent: "oklch(0.85 0.2 100)", scopeKey: "all" },
    ];
    if (scope === "all") return stats;
    return stats.filter((s) => s.scopeKey === scope || s.scopeKey === "all");
  }, [o, scope]);

  const mediaDistribution = useMemo(() => {
    const source = Object.keys(m.completionByType).length > 0 ? m.completionByType : m.totalByType;
    return Object.entries(source).map(([name, value], idx) => {
      const colors = ["var(--primary)", "oklch(0.65 0.22 295)", "oklch(0.72 0.16 160)", "oklch(0.7 0.18 25)", "oklch(0.82 0.16 80)"];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      return { name: formattedName, value, color: colors[idx % colors.length] };
    });
  }, [m]);

  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-white/5" />}>
    <main className="pb-32 pt-2">
      {/* ============ Zone 1 — Hero ============ */}
      <motion.section
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <PremiumGlass
          variant="strong"
          className="relative overflow-hidden rounded-[40px] p-10 md:p-16"
          glow="oklch(0.72 0.18 255 / 0.4)"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 20% 20%, oklch(0.65 0.22 295 / 0.25), transparent 60%),radial-gradient(ellipse 60% 60% at 80% 70%, oklch(0.72 0.18 255 / 0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" /> Hello {todayStr ? `· ${todayStr}` : ''}
            </div>
            <h1 className="mt-5 font-display text-5xl tracking-tight md:text-7xl">
              <span className="text-gradient-aurora">A year of stories,</span>
              <br />
              told back to you.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
              You've spent {o.hoursSpent} hours immersed in different worlds.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                {
                  l: "Current streak",
                  v: s.current,
                  suffix: " days",
                  a: "oklch(0.82 0.16 80 / 0.45)",
                },
                { l: "Total stories", v: o.totalItems, a: "oklch(0.72 0.18 255 / 0.45)" },
                {
                  l: "Hours experienced",
                  v: o.hoursSpent,
                  suffix: "h",
                  a: "oklch(0.65 0.22 295 / 0.45)",
                },
                {
                  l: "Journal entries",
                  v: o.journalEntries,
                  a: "oklch(0.72 0.16 160 / 0.45)",
                },
                { l: "Memories", v: o.memories, a: "oklch(0.7 0.18 25 / 0.45)" },
              ].map((st) => (
                <div key={st.l} className="glass-subtle relative overflow-hidden rounded-2xl p-4">
                  <div
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
                    style={{ background: st.a }}
                  />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {st.l}
                    </div>
                    <div className="mt-2 font-display text-3xl tracking-tight">
                      <CountUp to={st.v} suffix={st.suffix ?? ""} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumGlass>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <SegmentedFilter
            value={range}
            onChange={setRange}
            options={[
              { value: "lifetime", label: "Lifetime" },
              { value: "year", label: "Year" },
              { value: "month", label: "Month" },
              { value: "week", label: "Week" },
            ]}
          />
          <SegmentedFilter
            value={scope}
            onChange={setScope}
            options={[
              { value: "all", label: "Everything" },
              { value: "movies", label: "Movies" },
              { value: "anime", label: "Anime" },
              { value: "books", label: "Books" },
              { value: "games", label: "Games" },
            ]}
          />
        </div>
      </motion.section>

      {/* ============ Live numbers (real, not editorial) ============ */}
      <Zone
        eyebrow="Live"
        title="Your real numbers"
        sub="Sourced from your library — updates as you act."
      >
        <LiveStatsStrip />
        <div className="mt-10">
          <YourReflectionsRail limit={4} title="Reflections you've written" eyebrow="Memory" />
        </div>
      </Zone>

      {/* ============ Zone 2 — Lifetime stats ============ */}
      <Zone
        eyebrow="Zone 02"
        title="Lifetime statistics"
        sub="Everything you've experienced, gently counted."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          {lifetimeStats.map((st) => {
            const Icon = KIND_ICON[st.label] ?? Film;
            return (
              <StatCardPremium
                key={st.label}
                label={st.label}
                value={st.value}
                delta={st.delta as any}
                accent={st.accent + " / 0.4"}
                icon={<Icon className="h-4 w-4 text-muted-foreground/70" />}
              />
            );
          })}
        </div>
      </Zone>

      {/* ============ Zone 3 — Monthly activity ============ */}
      <Zone eyebrow="Zone 03" title="Monthly activity" sub="Sixty days of attention.">
        <ChartStory
          observation="Your activity trends captured daily."
          why="A reflection of your continuous journey."
          meaning="Tracking your time helps you understand your rhythm."
          memory="Keep exploring new worlds."
        >
          <PremiumGlass className="p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { l: "Monthly total", v: o.hoursSpent, s: "h" },
                { l: "Weekly average", v: o.hoursSpent / 4, s: "h", d: 1 },
                { l: "Longest streak", v: s.longest, s: "d" },
                { l: "Current streak", v: s.current, s: "d" },
              ].map((st) => (
                <div key={st.l}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {st.l}
                  </div>
                  <div className="mt-1.5 font-display text-3xl tracking-tight">
                    <CountUp to={st.v} suffix={st.s} decimals={st.d ?? 0} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 h-72">
              <ErrorBoundary fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Chart could not be loaded</div>}>
              <ResponsiveContainer>
                <AreaChart data={s.monthlyActivity || []} role="img" aria-label="Monthly activity area chart">
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="oklch(0.55 0 0)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis
                    stroke="oklch(0.55 0 0)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    content={<GlassTooltip />}
                    cursor={{ stroke: "oklch(1 0 0 / 0.1)", strokeWidth: 1 }}
                  />
                  <Area
                    dataKey="count"
                    name="Count"
                    stroke="oklch(0.78 0.18 255)"
                    strokeWidth={2}
                    fill="url(#aGrad)"
                    isAnimationActive={!reduced}
                  />
                </AreaChart>
              </ResponsiveContainer>
              </ErrorBoundary>
            </div>
          </PremiumGlass>
        </ChartStory>
      </Zone>

      {/* ============ Zone 4 — Media distribution ============ */}
      <Zone eyebrow="Zone 4" title="Media distribution" sub="The shape of your library.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PremiumGlass className="p-6 md:p-8">
            <div className="h-72">
              <ErrorBoundary fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Chart could not be loaded</div>}>
              <ResponsiveContainer>
                <PieChart role="img" aria-label="Media distribution pie chart">
                  <Pie
                    data={mediaDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={!reduced}
                  >
                    {mediaDistribution.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              </ErrorBoundary>
            </div>
          </PremiumGlass>
          <PremiumGlass className="p-6 md:p-8">
            <div className="space-y-3">
              {mediaDistribution.map((d) => {
                const total = mediaDistribution.reduce((a, b) => a + b.value, 0);
                const pct = total === 0 ? 0 : (d.value / total) * 100;
                return (
                  <div key={d.name} className="group flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="w-24 text-sm">{d.name}</span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: d.color, boxShadow: `0 0 12px ${d.color}` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                    <span className="w-10 text-right text-xs tabular-nums">{d.value}</span>
                  </div>
                );
              })}
            </div>
          </PremiumGlass>
        </div>
      </Zone>

      {/* ============ Zone 5 — Completion insights ============ */}
      <Zone eyebrow="Zone 05" title="Completion insights">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Reviews", value: m.reviewCount, ring: 60, accent: "var(--primary)" },
            { label: "Favorites", value: m.favoriteCount, ring: 30, accent: "oklch(0.65 0.22 295)" },
            { label: "Bookmarks", value: m.bookmarkCount, ring: 45, accent: "oklch(0.82 0.16 80)" },
            { label: "Completion Streak", value: s.completionStreak, ring: 80, accent: "oklch(0.7 0.18 25)" },
            { label: "Journal Streak", value: s.journalStreak, ring: 70, accent: "oklch(0.72 0.16 160)" },
            { label: "Avg Rating", value: o.averageRating ?? 0, ring: 75, accent: "oklch(0.85 0.2 100)" },
          ].map((c) => (
            <PremiumGlass
              key={c.label}
              className="flex flex-col items-center gap-3 p-5 text-center"
            >
              <ProgressRing value={c.ring} accent={c.accent}>
                <div className="font-display text-2xl tracking-tight">
                  <CountUp to={c.value} />
                </div>
              </ProgressRing>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {c.label}
              </div>
            </PremiumGlass>
          ))}
        </div>
      </Zone>

      {/* ============ Zone 6 — Genre analysis ============ */}
      <Zone eyebrow="Zone 06" title="Genre analysis" sub="What you reach for.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {g.topGenres.map((genre) => (
            <motion.div
              key={genre.genre}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4 }}
              className="glass group relative overflow-hidden rounded-3xl p-5"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-60 transition group-hover:opacity-100"
                style={{ background: (g as any).accent }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="font-display text-2xl tracking-tight">{genre.genre}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-current" /> {g.genreRatings[genre.genre] ?? 0}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {g.genreCompletion[genre.genre] ?? 0} completed
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(100, (g.genreTimeSpent[genre.genre] ?? 0) / 2)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "var(--primary)", boxShadow: `0 0 10px var(--primary)` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{g.genreTimeSpent[genre.genre] ?? 0}h</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Zone>

      {/* ============ Zone 10 — Smart insights ============ */}
      <Zone eyebrow="Zone 10" title="Smart insights" sub="Patterns Chronicle noticed.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            `Your most active weekday is ${i.mostActiveWeekday}.`,
            i.favoriteGenre ? `You favor ${i.favoriteGenre} the most.` : null,
            i.longestBinge ? `Your longest binge was ${i.longestBinge}.` : null,
            i.mostProductiveMonth ? `Your most productive month was ${i.mostProductiveMonth}.` : null,
          ].filter(Boolean).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className="glass-subtle group flex items-start gap-4 rounded-2xl p-5"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{line}</p>
            </motion.div>
          ))}
        </div>
      </Zone>

      {/* ============ Zone 17 — Personal records ============ */}
      <Zone eyebrow="Zone 17" title="Personal records">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Longest Binge", value: i.longestBinge || "N/A", date: "All time", accent: "oklch(0.72 0.18 255 / 0.6)" },
            { label: "Most Rewatched", value: i.mostRewatchedMedia || "N/A", date: "All time", accent: "oklch(0.82 0.16 80 / 0.6)" },
            { label: "Most Reread Book", value: i.mostRereadBook || "N/A", date: "All time", accent: "oklch(0.65 0.22 295 / 0.6)" },
            { label: "Most Replayed Game", value: i.mostReplayedGame || "N/A", date: "All time", accent: "oklch(0.72 0.16 160 / 0.6)" },
          ].map((r) => (
            <PremiumGlass key={r.label} className="relative overflow-hidden p-6">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-60"
                style={{ background: r.accent }}
              />
              <div className="relative">
                <Trophy className="h-5 w-5 text-amber-300" />
                <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {r.label}
                </div>
                <div className="mt-2 font-display text-3xl tracking-tight">{r.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{r.date}</div>
              </div>
            </PremiumGlass>
          ))}
        </div>
      </Zone>

      {/* Memory · What Chronicle noticed */}
      <Zone
        eyebrow="Memory"
        title="What Chronicle noticed"
        sub="Observations from your reading, watching and listening."
      >
        <MemoryInsights max={6} />
      </Zone>
    </main>
    </Suspense>
  );
}

function Zone({
  eyebrow,
  title,
  sub,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      initial={{ opacity: 0, y: reduced ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 md:mt-24"
    >
      <ZoneHeading eyebrow={eyebrow} title={title} sub={sub} action={action} />
      {children}
    </motion.section>
  );
}
