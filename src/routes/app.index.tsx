import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { format } from "date-fns";
import { CinematicHero } from "@/components/media/CinematicHero";
import { Plus, NotebookPen, Calendar } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PullQuote } from "@/components/editorial/PullQuote";

import { useDashboard, useOverview } from "@/hooks/use-analytics";
import { adaptContinueItem, activityToContinueItem } from "@/lib/adapters/media";

export const Route = createFileRoute("/app/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Dashboard — Avuno" },
      {
        name: "description",
        content: "Your personal media headquarters.",
      },
      { property: "og:title", content: "Avuno Dashboard" },
      { property: "og:description", content: "Your personal media headquarters." },
    ],
  }),
});

function Home() {
  const { data: dashboard, isLoading, isError, error } = useDashboard();
  const { data: overview } = useOverview();

  // "Current Moment" Date
  const today = format(new Date(), "EEEE, MMMM do");

  if (isLoading) {
    return (
      <div className="pt-8 space-y-12">
        <div className="space-y-4">
          <ShimmerSkeleton className="h-6 w-32 rounded-md" />
          <ShimmerSkeleton className="h-10 w-64 rounded-md" />
        </div>
        <ShimmerSkeleton className="h-[520px] rounded-[40px]" />
        <ShimmerSkeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-2">
        <PremiumErrorState
          title="Couldn't load your dashboard"
          description={error?.message ?? "Something went wrong. Please try again."}
        />
      </div>
    );
  }

  const isNewUser = !isLoading && !isError && overview?.totalLibraryItems === 0;

  // Active Story Priority: continueWatching/Reading/Playing
  // The backend API actually provides all of these in dashboard
  const activeItems = [
    ...(dashboard?.continueWatching ?? []),
    ...(dashboard?.continueReading ?? []),
    ...(dashboard?.continuePlaying ?? []),
  ];

  const featuredItem = activeItems.length > 0 ? adaptContinueItem(activeItems[0]) : null;

  // Reflection Priority: OnThisDay (simulated via calendar day if available), otherwise recentMemories[0]
  const recentMemory = dashboard?.recentMemories?.[0];

  return (
    <div className="flex flex-col min-h-screen pt-4 pb-24 md:pt-10 space-y-16">
      {/* 1. CURRENT MOMENT */}
      <section className="px-1 md:px-0">
        <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3 font-medium">
          {today}
        </div>
        <ErrorBoundary fallback={<div />}>
          <DashboardGreeting />
        </ErrorBoundary>
      </section>

      {/* 2. ACTIVE STORY OR ONBOARDING */}
      {isNewUser ? (
        <OnboardingGuide />
      ) : (
        <section>
          {featuredItem ? <CinematicHero item={featuredItem} /> : <EmptyActiveStory />}
        </section>
      )}

      {/* 3. REFLECTION */}
      {!isNewUser && recentMemory && (
        <section className="max-w-4xl mx-auto w-full">
          <PullQuote
            attribution={
              recentMemory.date
                ? `Memory from ${format(new Date(recentMemory.date), "MMMM do, yyyy")}`
                : undefined
            }
          >
            {String(recentMemory.metadata?.content || recentMemory.title)}
          </PullQuote>
        </section>
      )}
    </div>
  );
}

function EmptyActiveStory() {
  const navigate = useNavigate();
  return (
    <div className="glass-strong rounded-[40px] p-16 text-center flex flex-col items-center justify-center space-y-6">
      <div className="text-muted-foreground">You don't have any active stories at the moment.</div>
      <PremiumButton variant="secondary" size="sm" onClick={() => navigate({ to: "/app/library" })}>
        Open Library
      </PremiumButton>
    </div>
  );
}

function OnboardingGuide() {
  const navigate = useNavigate();
  return (
    <div className="mt-4 space-y-10">
      <div className="text-center bg-white/5 border border-white/10 rounded-[40px] p-12 md:p-20">
        <h2 className="font-display text-4xl tracking-tight md:text-5xl mb-6">Welcome to Avuno.</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          Start by adding a movie, book, or game.
        </p>
        <PremiumButton
          variant="primary"
          size="lg"
          onClick={() => navigate({ to: "/app/library" })}
          className="mx-auto"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Media
        </PremiumButton>
      </div>
    </div>
  );
}
