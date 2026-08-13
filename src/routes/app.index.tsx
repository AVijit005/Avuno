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
    <div className="flex flex-col min-h-screen pt-2 pb-24 md:pt-6 space-y-10">
      <section className="px-1 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-eyebrow mb-3 font-medium">{today}</div>
          <ErrorBoundary fallback={<div />}>
            <DashboardGreeting />
          </ErrorBoundary>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/journal"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl glass-subtle hover:bg-foreground/[0.07] transition-[background-color,transform] duration-[140ms] active:scale-[0.98]"
          >
            <NotebookPen className="w-4 h-4 text-muted-foreground" />
            Write Entry
          </Link>
          <button
            id="home-add-media-btn"
            onClick={openAdd}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-[background-color,transform,box-shadow] duration-[140ms] shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[1px]"
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
            <section>
              <div className="flex items-center gap-2 mb-6 px-1 md:px-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium">Jump Back In</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {activeItems.map((item) => (
                  <div key={item.id} className="snap-start">
                    <ContinueCard item={item} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl glass-subtle p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Library className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium">Library Pulse</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-display">{overview?.totalLibraryItems ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Items saved</div>
                </div>
                <div>
                  <div className="text-3xl font-display text-primary">
                    {activeItems.length ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Currently active</div>
                </div>
                <div>
                  <div className="text-3xl font-display">
                    {dashboard?.recentMemories?.length ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Recent memories</div>
                </div>
                <div>
                  <div className="text-3xl font-display">{overview?.totalJournalEntries ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-1">Journal entries</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl glass-subtle p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-eyebrow font-medium">Insights</h2>
              </div>
              <MemoryInsights max={2} />
            </div>
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
      <div className="glass-subtle rounded-2xl p-8 md:p-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">
            Add your first piece of media.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Avuno tracks every movie, book, game, and show you consume. Once you add something, it
            powers your entire experience:
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pillars.map(({ icon: Icon, label, hint }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-foreground/[0.07] bg-foreground/[0.04] p-4"
              >
                <Icon className="h-4 w-4 text-primary" />
                <div className="text-sm font-medium">{label}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{hint}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PremiumButton variant="primary" onClick={openAdd}>
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
