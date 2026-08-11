import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useMemo, useEffect } from "react";
import { useScroll, useTransform, useReducedMotion, motion } from "motion/react";
import { Star, NotebookPen, Trophy, Layers } from "lucide-react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumImage } from "@/components/ui/PremiumImage";
import { CountUp, SegmentedFilter, ZoneHeading } from "@/components/analytics/AnalyticsKit";
import { MediaEvolution } from "@/components/intelligence/MediaEvolution";
import { LiveStatsStrip } from "@/components/memory/LiveStatsStrip";
import { YourReflectionsRail } from "@/components/memory/YourReflectionsRail";
import { useTimelineEvents, useJournalStats } from "@/hooks/use-journal";
import { adaptTimelineEvent } from "@/lib/adapters/journal";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { CreateMemoryCapsule } from "@/components/memory/CreateMemoryCapsule";
import type { TimelineEventResponse } from "@/lib/api/journal";

export const Route = createFileRoute("/app/timeline")({
  component: TimelinePage,
  pendingComponent: PageSkeleton,
});

function TimelinePage() {
  const [year, setYear] = useState<string>("");
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);
  const [preservingEvent, setPreservingEvent] = useState<TimelineEventResponse | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const reduced = useReducedMotion();

  const { data: timelineData, isLoading } = useTimelineEvents();
  const { data: statsData } = useJournalStats();

  const allEvents = useMemo(
    () => (timelineData?.items ?? []).map(adaptTimelineEvent),
    [timelineData],
  );

  const years = useMemo(() => {
    const y = new Set<string>();
    allEvents.forEach((e) => y.add(new Date(e.eventDate).getFullYear().toString()));
    if (y.size === 0) y.add(new Date().getFullYear().toString());
    return Array.from(y).sort((a, b) => Number(b) - Number(a));
  }, [allEvents]);

  const yearEvents = useMemo(() => {
    return allEvents.filter((e) => new Date(e.eventDate).getFullYear().toString() === year);
  }, [allEvents, year]);

  return (
    <div className="pb-32 pt-2">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: reduced ? 0 : 24, filter: reduced ? "none" : "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: reduced ? "none" : "blur(0)" }}
        transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <PremiumGlass
          variant="strong"
          className="relative overflow-hidden rounded-[40px] p-10 md:p-16"
          glow="oklch(0.65 0.22 295 / 0.4)"
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/5 to-background" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Life through media
            </div>
            <h1 className="mt-5 font-display text-5xl tracking-tight md:text-7xl">
              <span className="text-gradient-aurora">Your timeline.</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">
              A vertical river of every story you've finished — from years ago to last night.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { l: "Years tracked", v: years.length },
                { l: "Stories", v: statsData?.timelineEventCount ?? 0 },
                { l: "Journals", v: statsData?.journalCount ?? 0 },
                { l: "Longest streak", v: statsData?.writingStreak ?? 0, s: "d" },
              ].map((s) => (
                <div key={s.l} className="glass-subtle rounded-2xl p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="mt-2 font-display text-3xl tracking-tight">
                    {typeof s.v === "number" ? <CountUp to={s.v} suffix={s.s ?? ""} /> : s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumGlass>
      </motion.section>

      {/* Live numbers from libraryStore */}
      <section className="mt-10">
        <LiveStatsStrip eyebrow="Your timeline · live" />
      </section>

      {/* Reflections written along the way */}
      <section className="mt-12">
        <YourReflectionsRail limit={4} title="Reflections along the way" eyebrow="Your words" />
      </section>

      {/* Year selector */}
      <div className="mt-10 flex justify-center">
        <SegmentedFilter
          value={year}
          onChange={setYear}
          options={years.map((y) => ({ value: y, label: y }))}
        />
      </div>

      {/* Life timeline */}
      <section ref={ref} className="relative mt-16">
        <ZoneHeading
          eyebrow="Year"
          title={`${year} in stories`}
          sub="Scroll. The line grows with you."
        />
        <div className="relative pl-2 md:pl-4">
          {/* growing line */}
          <div className="absolute left-5 top-0 bottom-0 w-px overflow-hidden bg-white/[0.05] md:left-7">
            <motion.div
              className="w-full bg-gradient-to-b from-primary via-secondary to-amber-300/70"
              style={{ height: lineHeight }}
            />
          </div>
          <div className="space-y-8">
            {yearEvents.length === 0 && !isLoading && (
              <div className="pl-14 md:pl-20 text-muted-foreground">No events for this year.</div>
            )}
            {yearEvents.map((e, i) => {
              // Map UI event properties from metadata or fallback
              const rawEvent = (timelineData?.items ?? []).find((d) => d.id === e.id);
              const meta = rawEvent?.metadata ?? {};
              const media = {
                poster: meta.mediaPoster as string | undefined,
                title: (meta.mediaTitle as string) || e.title,
                creator: (meta.mediaCreator as string) || "Creator",
                accent: e.color || "var(--primary)",
              };
              const when = new Date(e.eventDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const mood = (meta.mood as string) || e.type;
              const journal = e.description || (meta.journalExcerpt as string);
              const rating = meta.rating as number | undefined;
              const achievement = meta.achievement as string | undefined;
              const collection = meta.collection as string | undefined;

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: reduced ? 0 : -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.04 }}
                  className="relative pl-14 md:pl-20"
                >
                  <motion.span
                    className="absolute left-2 top-4 grid h-7 w-7 place-items-center rounded-full md:left-4"
                    style={{
                      background: "oklch(0.18 0.014 270)",
                      border: `2px solid ${media.accent ?? undefined}`,
                      boxShadow: `0 0 18px ${media.accent ?? undefined}`,
                    }}
                    whileInView={{ scale: reduced ? 1 : [0.6, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: reduced ? 0 : 0.6 }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: media.accent }} />
                  </motion.span>

                  <PremiumGlass interactive glow={media.accent} className="flex gap-5 p-5">
                    <PremiumImage
                      src={media.poster || ""}
                      alt=""
                      className="h-28 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                      style={{ viewTransitionName: `timeline-poster-${e.id}` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {when} · {mood}
                      </div>
                      <div className="mt-1 truncate font-display text-2xl tracking-tight">
                        {media.title}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {media.creator}
                      </div>
                      {journal && (
                        <p className="mt-3 line-clamp-2 text-sm italic text-foreground/85">
                          "{journal}"
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" /> {rating}
                          </span>
                        )}
                        {journal && (
                          <span className="flex items-center gap-1">
                            <NotebookPen className="h-3 w-3" /> Journal
                          </span>
                        )}
                        {achievement && (
                          <span className="flex items-center gap-1 text-amber-300/90">
                            <Trophy className="h-3 w-3" /> {achievement}
                          </span>
                        )}
                        {collection && (
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" /> {collection}
                          </span>
                        )}
                      </div>
                      <div className="mt-5 border-t border-white/5 pt-4">
                        {rawEvent?.memoryId ? (
                          <Link
                            to="/app/memories/$id"
                            params={{ id: rawEvent.memoryId }}
                            className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-primary hover:text-primary-foreground transition-colors"
                          >
                            View Memory
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (rawEvent) setPreservingEvent(rawEvent);
                            }}
                            className="inline-flex items-center text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-white transition-colors"
                          >
                            Preserve as Memory
                          </button>
                        )}
                      </div>
                    </div>
                  </PremiumGlass>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial highlights */}
      <motion.section
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reduced ? 0 : 0.7 }}
        className="mt-24"
      >
        <ZoneHeading eyebrow="Highlights" title="Editorial highlights" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3"></div>
      </motion.section>

      {/* Journey statistics */}
      <motion.section
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduced ? 0 : 0.7 }}
        className="mt-24"
      >
        <ZoneHeading eyebrow="Journey" title="The numbers behind it" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { l: "Stories tracked", v: allEvents?.length || 0 },
            { l: "Journal entries", v: 0 },
            { l: "Achievements", v: 0 },
          ].map((s) => (
            <PremiumGlass key={s.l} className="p-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.l}
              </div>
              <div className="mt-2 font-display text-4xl tracking-tight">
                <CountUp to={s.v} />
              </div>
            </PremiumGlass>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-24"
      >
        <MediaEvolution />
      </motion.section>

      {preservingEvent && (
        <CreateMemoryCapsule
          isOpen={true}
          onClose={() => setPreservingEvent(null)}
          sourceTimeline={preservingEvent}
        />
      )}
    </div>
  );
}
