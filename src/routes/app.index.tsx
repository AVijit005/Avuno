import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React from "react";
import { CinematicHero } from "@/components/media/CinematicHero";
import { MediaCard } from "@/components/media/MediaCard";
import { Section } from "@/components/common/Section";
import { Plus, NotebookPen, Calendar } from "lucide-react";
import { OnThisDay } from "@/components/memory/OnThisDay";
import { GoalHero } from "@/components/goals/GoalHero";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";

import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardContext } from "@/components/dashboard/DashboardContext";
import { ContinueJourneyHero } from "@/components/dashboard/ContinueJourneyHero";
import { DailyRitual } from "@/components/dashboard/DailyRitual";
import { DailyFocus } from "@/components/dashboard/DailyFocus";
import { TodayInHistory } from "@/components/dashboard/TodayInHistory";
import { DashboardMood } from "@/components/dashboard/DashboardMood";
import { WeeklyReflection } from "@/components/dashboard/WeeklyReflection";
import { NotificationStrip } from "@/components/dashboard/NotificationStrip";
import { MiniTimeline } from "@/components/dashboard/MiniTimeline";
import { LivingStats } from "@/components/dashboard/LivingStats";
import { QuietRecommendations } from "@/components/dashboard/QuietRecommendations";
import { SmartFooter } from "@/components/dashboard/SmartFooter";
import { InteractiveWidgets } from "@/components/dashboard/QuickActions";
import { PullQuote } from "@/components/editorial/PullQuote";
import { Collage } from "@/components/editorial/Collage";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useDashboard, useInsights, useOverview, useDiscovery, useChallenges, useIntelligence } from "@/hooks/use-analytics";
import { useCollections } from "@/hooks/use-collections";
import { adaptContinueItem, activityToContinueItem } from "@/lib/adapters/media";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import { adaptInsights, adaptOverview } from "@/lib/adapters/analytics";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export const Route = createFileRoute("/app/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Dashboard — Chronicle" },
      { name: "description", content: "Your personal media headquarters. Continue stories, track progress, and discover what to watch next." },
      { property: "og:title", content: "Chronicle Dashboard" },
      { property: "og:description", content: "Your personal media headquarters." },
    ],
  }),
});

const QUOTES = [
  { quote: "Some stories ask you to finish them. Others wait quietly until you're ready to be changed.", attr: "Your weekly reflection" },
  { quote: "The stories we return to say more about us than the stories we finish.", attr: "Your taste profile" },
  { quote: "Memory isn't about perfect recall. It's about what chooses to stay.", attr: "From your journal" },
  { quote: "Every library is a self-portrait painted in other people's stories.", attr: "A quiet thought" },
];

function Home() {
  const [dailyQuote, setDailyQuote] = React.useState(QUOTES[0]);
  React.useEffect(() => {
    setDailyQuote(QUOTES[new Date().getDate() % QUOTES.length]);
  }, []);

  const { data: dashboard, isLoading, isError, error } = useDashboard();
  const { data: insights } = useInsights();
  const { data: overview } = useOverview();
  const { data: discovery } = useDiscovery();
  const { data: challengesData } = useChallenges();
  const { data: intelligence } = useIntelligence();
  const { data: collections } = useCollections();

  if (isLoading) {
    return (
      <div className="pt-2 space-y-8">
        <ShimmerSkeleton className="h-[520px] rounded-b-[40px]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ShimmerSkeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <ShimmerSkeleton className="h-24 rounded-3xl" />
        <ShimmerSkeleton className="h-64 rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <ShimmerSkeleton className="h-48 rounded-3xl" />
          <ShimmerSkeleton className="h-48 rounded-3xl" />
        </div>
        <ShimmerSkeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-2">
        <PremiumErrorState title="Couldn't load your dashboard" description={error?.message ?? "Something went wrong. Please try again."} />
      </div>
    );
  }

  const continueItems = dashboard?.continueWatching ?? [];
  const recentlyCompletedItems = dashboard?.recentlyCompleted ?? [];
  const collectionList = collections?.map(adaptCollectionResponse) ?? [];
  const uiInsights = insights ? adaptInsights(insights) : null;
  const uiOverview = overview ? adaptOverview(overview) : null;

  const isNewUser = !isLoading && !isError && uiOverview?.totalItems === 0;

  const featuredItem = continueItems[0]
    ? adaptContinueItem(continueItems[0])
    : recentlyCompletedItems[0]
      ? adaptContinueItem(activityToContinueItem(recentlyCompletedItems[0]))
      : null;

  return (
    <div className="pt-2">
      {featuredItem ? <CinematicHero item={featuredItem} /> : (
        <div className="glass-strong rounded-b-[40px] p-16 text-center">
          <p className="text-muted-foreground">Add some media to your library to see your dashboard come alive.</p>
        </div>
      )}

      {isNewUser ? (
        <OnboardingGuide />
      ) : (
      <>
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Failed to load interactive widgets.</div>}>
          <InteractiveWidgets />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Greeting failed to load.</div>}>
          <DashboardGreeting className="mt-10" />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Notifications failed to load.</div>}>
          <NotificationStrip className="mt-4" />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Daily ritual failed to load.</div>}>
          <DailyRitual className="mt-8" insights={uiInsights} />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Journey failed to load.</div>}>
          <ContinueJourneyHero className="mt-8" />
        </ErrorBoundary>
        
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Focus failed to load.</div>}>
            <DailyFocus />
          </ErrorBoundary>
          <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">History failed to load.</div>}>
            <TodayInHistory />
          </ErrorBoundary>
        </div>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">On this day failed to load.</div>}>
          <OnThisDay variant="compact" className="mt-12" />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Quote failed to load.</div>}>
          <PullQuote attribution={dailyQuote.attr}>{dailyQuote.quote}</PullQuote>
        </ErrorBoundary>
        
        <div className="mt-16 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Challenges failed to load.</div>}>
            <ChallengeCard challenge={challengesData?.challenges?.[0] as any} />
          </ErrorBoundary>
          <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Goals failed to load.</div>}>
            <GoalHero goal={challengesData?.goals?.[0] ? { id: challengesData.goals[0].id, title: challengesData.goals[0].title, description: challengesData.goals[0].description, current: challengesData.goals[0].current, target: challengesData.goals[0].target, reward: challengesData.goals[0].reward, accent: challengesData.goals[0].accent, startedAt: challengesData.goals[0].startedAt, priority: challengesData.goals[0].priority } : null} />
          </ErrorBoundary>
        </div>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Context failed to load.</div>}>
          <DashboardContext className="mt-10" />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Mood failed to load.</div>}>
          <DashboardMood className="mt-16" />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Reflection failed to load.</div>}>
          <WeeklyReflection className="mt-6" overview={uiOverview} />
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Stats failed to load.</div>}>
          <div className="mt-16 pointer-events-auto">
            <PremiumGlass interactive variant="strong" glow="oklch(0.72 0.18 255 / 0.2)" className="group/master rounded-[2.5rem]">
              <div className="flex flex-col text-left p-10 w-full">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85 mb-3">This is you</div>
                  <h2 className="font-display text-3xl tracking-tight md:text-4xl">A quiet glance at your patterns</h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">Not metrics — moods. The shape of how you've been spending your stories this month. Look softly. Nothing here demands a goal.</p>
                </div>
                <div className="flex flex-row flex-wrap gap-5 mt-8">
                  <LivingStats className="flex flex-row flex-wrap gap-5 m-0 p-0" />
                </div>
              </div>
            </PremiumGlass>
          </div>
        </ErrorBoundary>

        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Collections failed to load.</div>}>
          {collectionList.length > 0 && (
            <Section title="Collections" subtitle="Stories grouped by feeling." action={<Link to="/app/collections" className="story-link text-sm text-muted-foreground hover:text-foreground">All collections</Link>}>
              <Collage items={collectionList.slice(0, 4).map((c) => ({ id: c.id, image: c.cover ?? "", alt: c.name, node: (<div className="rounded-2xl bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12"><div className="font-display text-xl tracking-tight text-white">{c.name}</div><div className="text-xs text-white/70">{c.itemCount} items</div></div>) }))} />
            </Section>
          )}
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Timeline failed to load.</div>}>
          <Section title="Lately" subtitle="A small editorial timeline.">
            <MiniTimeline />
          </Section>
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Completed items failed to load.</div>}>
          {recentlyCompletedItems.length > 0 && (
            <Section title="Recently completed" subtitle="The stories that just became yours.">
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6">
                {recentlyCompletedItems.slice(0, 6).map((item) => {
                  const uiItem = adaptContinueItem(activityToContinueItem(item));
                  return <MediaCard key={uiItem.id} item={uiItem} />;
                })}
              </div>
            </Section>
          )}
        </ErrorBoundary>
        
        <ErrorBoundary fallback={<div className="p-4 text-sm text-muted-foreground text-center">Footer failed to load.</div>}>
          <SmartFooter className="mt-20" />
        </ErrorBoundary>
      </>
      )}
    </div>
  );
}

function OnboardingGuide() {
  const navigate = useNavigate();
  const STEPS = [
    { number: "01", title: "Add your first story", description: "Search for any movie, book, game, or show and add it to your library. That's how Chronicle starts knowing you.", icon: Plus, action: "Open library", to: "/app/library" },
    { number: "02", title: "Write a journal entry", description: "Capture a thought about what you watched. Even one sentence starts a memory.", icon: NotebookPen, action: "Open journal", to: "/app/journal" },
    { number: "03", title: "Explore your calendar", description: "See your year mapped out — every story, every quiet evening arranged into a timeline.", icon: Calendar, action: "Open calendar", to: "/app/calendar" },
  ];

  return (
    <div className="mt-10 space-y-10">
      <div className="text-center">
        <h2 className="font-display text-4xl tracking-tight md:text-5xl">Welcome to Chronicle</h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          A quiet place to remember every story you've lived. Start with these three steps.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <PremiumGlass key={step.number} interactive variant="default" className="p-6 md:p-8 cursor-pointer" glow="oklch(0.72 0.18 255 / 0.15)">
            <div className="text-[10px] uppercase tracking-[0.28em] text-primary/85 mb-3">{step.number}</div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 mb-4">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-xl tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            <div className="mt-6">
              <PremiumButton variant="secondary" size="sm" onClick={() => navigate({ to: step.to })}>
                {step.action}
              </PremiumButton>
            </div>
          </PremiumGlass>
        ))}
      </div>
    </div>
  );
}
