import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { format } from "date-fns";
import { Plus, NotebookPen, Clock, Library, History } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContinueCard } from "@/components/library/ContinueCard";
import { MemoryInsights } from "@/components/memory/MemoryInsights";

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
    <div className="flex flex-col min-h-screen pt-4 pb-24 md:pt-10 space-y-16">
      <section className="px-1 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-3 font-medium">
            {today}
          </div>
          <ErrorBoundary fallback={<div />}>
            <DashboardGreeting />
          </ErrorBoundary>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/journal"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-surface-2 hover:bg-surface-3 transition-colors border border-border/40"
          >
            <NotebookPen className="w-4 h-4 text-muted-foreground" />
            Write Entry
          </Link>
          <Link
            to="/app/library"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </Link>
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
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Jump Back In
                </h2>
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
            <div className="rounded-[24px] border border-border/40 bg-surface-1 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Library className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Library Pulse
                </h2>
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

            <div className="rounded-[24px] border border-border/40 bg-surface-1 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Insights
                </h2>
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
  const navigate = useNavigate();
  return (
    <div className="mt-4">
      <div className="bg-surface-1 border border-border/40 rounded-[24px] p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight">
            Your media life, recorded.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
            Avuno is the command center for the stories you consume. Track movies, books, and games.
            Log your progress, write your reflections, and let the timeline map your tastes over
            time.
          </p>
          <div className="pt-2">
            <PremiumButton variant="primary" onClick={() => navigate({ to: "/app/library" })}>
              Start building your library
            </PremiumButton>
          </div>
        </div>
        <div className="flex-1 w-full max-w-sm">
          <div className="aspect-[4/3] rounded-xl border border-border/40 bg-surface-2 flex items-center justify-center p-6 text-center text-muted-foreground/60 text-sm">
            Your library begins here.
          </div>
        </div>
      </div>
    </div>
  );
}
