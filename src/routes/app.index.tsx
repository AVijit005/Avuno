import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { format } from "date-fns";
import { NotebookPen, Clock, Library, History, BookOpen, BarChart3 } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContinueCard } from "@/components/library/ContinueCard";
import { MemoryInsights } from "@/components/memory/MemoryInsights";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

import { useDashboard, useOverview } from "@/hooks/use-analytics";
import { adaptContinueItem } from "@/lib/adapters/media";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

export const Route = createFileRoute("/app/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Command Center — Avuno" },
      {
        name: "description",
        content: "Your personal media headquarters.",
      },
    ],
  }),
});

function Home() {
  const { data: dashboard, isLoading, isError, error } = useDashboard();
  const { data: overview } = useOverview();
  const { openAdd } = useMediaActions();
  const reduced = useReducedMotion();

  const today = format(new Date(), "EEEE, MMMM do");

  if (isLoading) {
    return (
      <div className="pt-8 space-y-12">
        <div className="space-y-4">
          <ShimmerSkeleton className="h-6 w-32 rounded-md" />
          <ShimmerSkeleton className="h-10 w-64 rounded-md" />
        </div>
        <ShimmerSkeleton className="h-[300px] rounded-[24px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-2">
        <PremiumErrorState
          title="Couldn't load your command center"
          description={error?.message ?? "Something went wrong. Please try again."}
        />
      </div>
    );
  }

  const isNewUser = !isLoading && !isError && overview?.totalLibraryItems === 0;

  const activeItems = [
    ...(dashboard?.continueWatching ?? []),
    ...(dashboard?.continueReading ?? []),
    ...(dashboard?.continuePlaying ?? []),
  ].map(adaptContinueItem);

  return (
    <div className="flex flex-col min-h-screen pt-2 pb-24 md:pt-6 space-y-10 md:space-y-14">
      <section className="px-1 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10 md:pt-14">
        <div>
          <div className="text-eyebrow mb-4 mt-4 md:mt-8 font-medium">{today}</div>
          <ErrorBoundary fallback={<div />}>
            <DashboardGreeting />
          </ErrorBoundary>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/journal"
            className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl glass hover:bg-foreground/[0.08] focus-ring transition-all duration-[140ms] hover:-translate-y-[1px] hover:shadow-md active:scale-[0.98]"
          >
            <NotebookPen className="w-4 h-4 text-muted-foreground" />
            Write Entry
          </Link>
          <button
            id="home-add-media-btn"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-primary text-primary-foreground focus-ring transition-all duration-[140ms] shadow-[0_4px_12px_-4px_oklch(0.72_0.18_255/0.6),inset_0_1px_0_oklch(1_1_1/0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_-4px_oklch(0.72_0.18_255/0.7),inset_0_1px_0_oklch(1_1_1/0.25)] hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[1px]"
          >
            <span className="text-base leading-none">+</span>
            Add Media
          </button>
        </div>
      </section>

      {isNewUser ? (
        <OnboardingGuide />
      ) : (
        <>
          {activeItems.length > 0 && (
            <motion.section
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="relative"
            >
              <div className="flex items-center gap-2 mb-6 px-1 md:px-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium">Jump Back In</h2>
              </div>
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar pe-12">
                  {activeItems.map((item) => (
                    <div key={item.id} className="snap-start">
                      <ContinueCard item={item} />
                    </div>
                  ))}
                </div>
                {/* Gradient fade hint for horizontal scroll */}
                <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-r from-transparent to-[var(--color-bg)] pointer-events-none" />
              </div>
            </motion.section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="rounded-[32px] glass p-6 md:p-8 card-interactive flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6">
                <Library className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium text-foreground">Library Pulse</h2>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1 content-start">
                <div>
                  <div className="text-4xl font-display font-semibold tracking-tight">
                    {overview?.totalLibraryItems ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Items saved</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-semibold tracking-tight text-primary">
                    {activeItems.length ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Currently active</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-semibold tracking-tight">
                    {dashboard?.recentMemories?.length ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Recent memories</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-semibold tracking-tight">
                    {overview?.totalJournalEntries ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">Journal entries</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="rounded-[32px] glass p-6 md:p-8 card-interactive flex flex-col"
            >
              <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium text-foreground">Insights</h2>
              </div>
              <MemoryInsights max={2} />
            </motion.div>
          </section>
        </>
      )}
    </div>
  );
}

function OnboardingGuide() {
  const { openAdd } = useMediaActions();
  const pillars = [
    { icon: Library, label: "Library", hint: "Your master archive" },
    { icon: Clock, label: "Timeline", hint: "Stories over time" },
    { icon: BookOpen, label: "Journal", hint: "Reflections & notes" },
    { icon: BarChart3, label: "Analytics", hint: "Patterns & insights" },
  ];
  return (
    <div className="mt-4">
      <div className="glass rounded-[32px] p-10 md:p-16 card-interactive relative overflow-hidden">
        {/* Subtle background glow for empty state */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10 mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center mx-auto mb-6">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-h2 font-display tracking-tight">Add your first piece of media.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Avuno tracks every movie, book, game, and show you consume. Once you add something, it
            powers your entire experience:
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pillars.map(({ icon: Icon, label, hint }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 rounded-2xl glass-subtle p-5 card-interactive"
              >
                <Icon className="h-5 w-5 text-primary mb-1" />
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground leading-snug">{hint}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <PremiumButton variant="primary" onClick={openAdd} className="min-h-[44px]">
              Add your first item
            </PremiumButton>
            <span className="text-xs text-muted-foreground">
              or press{" "}
              <kbd className="rounded border border-border/70 bg-background/60 px-1.5 py-0.5 text-[10px]">
                ⌘N
              </kbd>{" "}
              anywhere
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
