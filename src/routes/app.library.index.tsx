import { createFileRoute, Link } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { SectionHeader, RevealSection } from "@/components/dashboard/SectionHeader";
import { FeaturedCollections } from "@/components/collections/FeaturedCollections";
import { MediaCard } from "@/components/media/MediaCard";

import { LibraryHero } from "@/components/library/LibraryHero";
import { InsightStrip } from "@/components/library/InsightStrip";
import { StatsGrid } from "@/components/library/StatsGrid";
import { StatusOverviewRow } from "@/components/library/StatusOverviewRow";
import { ContinueCard } from "@/components/library/ContinueCard";
import { PlanningRow } from "@/components/library/PlanningRow";
import { RecentlyFinishedTimeline } from "@/components/library/RecentlyFinishedTimeline";
import { FavoritesGallery } from "@/components/library/FavoritesGallery";
import { MemoryHighlights } from "@/components/memory/MemoryHighlights";
import { RememberAgain } from "@/components/memory/RememberAgain";
import { ComfortStories } from "@/components/discovery/ComfortStories";
import { GoalCard } from "@/components/goals/GoalCard";

import { LibraryMap } from "@/components/intelligence/LibraryMap";
import { Collage } from "@/components/editorial/Collage";
import { PullQuote } from "@/components/editorial/PullQuote";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";

import { useLibrary, useLibraryByStatus, useLibraryStats } from "@/hooks/use-library";
import { useCollections } from "@/hooks/use-collections";
import { useChallenges } from "@/hooks/use-analytics";
import { adaptLibraryItem } from "@/lib/adapters/media";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import { adaptGoal } from "@/lib/goals";

export const Route = createFileRoute("/app/library/")({
  component: LibraryIndex,
  pendingComponent: PageSkeleton,
});

function LibraryIndex() {
  const { data: stats } = useLibraryStats();
  const { data: inProgressData, isLoading: isLoadingContinue } = useLibraryByStatus("WATCHING", {
    limit: 8,
  });
  const { data: planningData, isLoading: isLoadingPlanning } = useLibraryByStatus("PLANNING", {
    limit: 5,
  });
  const { data: favoritesData, isLoading: isLoadingFavorites } = useLibrary({
    favorite: true,
    limit: 8,
  });
  const { data: allData, isLoading: isLoadingAll } = useLibrary({ limit: 8 });
  const { data: collections } = useCollections();
  const { data: challengesData } = useChallenges();

  const isLoading = isLoadingContinue || isLoadingPlanning || isLoadingFavorites || isLoadingAll;

  if (isLoading) {
    return (
      <div className="space-y-16 pt-2 pb-24">
        <ShimmerSkeleton className="h-48 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <ShimmerSkeleton className="h-64 rounded-3xl" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-56 w-40 shrink-0 rounded-2xl" />
          ))}
        </div>
        <ShimmerSkeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
        <ShimmerSkeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  const cont = (inProgressData?.pages.flatMap((p) => p.data) ?? []).map(adaptLibraryItem);
  const plan = (planningData?.pages.flatMap((p) => p.data) ?? []).map(adaptLibraryItem);
  const favs = (favoritesData?.pages.flatMap((p) => p.data) ?? []).map(adaptLibraryItem);
  const recentlyAdded = (allData?.pages.flatMap((p) => p.data) ?? []).map(adaptLibraryItem);
  const collectionList = collections?.map(adaptCollectionResponse) ?? [];
  const wall = favs.slice(0, 4);
  const primaryGoal = challengesData?.goals?.[0] ? adaptGoal(challengesData.goals[0]) : null;

  return (
    <div className="space-y-16 pt-2 pb-24">
      <LibraryHero />

      <section>
        <InsightStrip />
      </section>

      <section>
        <SectionHeader
          eyebrow="Life dashboard"
          title="Where you are right now"
          subtitle="A live read on every story passing through your days."
        />
        <StatsGrid stats={stats} />
      </section>

      {/* Editorial memory wall — replaces 'just another grid' rhythm */}
      {wall.length >= 4 && (
        <RevealSection>
          <SectionHeader
            eyebrow="Memory wall"
            title="A glance through your archive"
            subtitle="Pinned moments — the gallery you'd hang in your own room."
          />
          <Collage
            items={wall.map((m) => ({
              id: m.mediaId,
              image: m.poster,
              alt: m.title,
              node: (
                <div className="rounded-2xl bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/70">
                    {m.kind}
                  </div>
                  <div className="font-display text-xl tracking-tight text-white">{m.title}</div>
                </div>
              ),
            }))}
          />
        </RevealSection>
      )}

      <RevealSection>
        <SectionHeader
          eyebrow="Status"
          title="Status overview"
          subtitle="The seven shapes of your library."
        />
        <StatusOverviewRow />
      </RevealSection>

      {cont.length > 0 && (
        <RevealSection>
          <SectionHeader
            eyebrow="Continue"
            title="Continue Journey"
            subtitle="Pick up where you left off — across every medium."
            action={
              <Link
                to="/app/library/continue"
                className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all duration-[300ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_20px_oklch(0.72_0.18_255/0.1)] active:scale-95 cursor-pointer"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 lg:-mx-10 lg:px-10">
            {cont.map((m) => (
              <div key={m.id} className="snap-start">
                <ContinueCard item={m} />
              </div>
            ))}
          </div>
        </RevealSection>
      )}

      {plan.length > 0 && (
        <RevealSection>
          <SectionHeader
            eyebrow="Planning"
            title="Planning Queue"
            subtitle="Stories waiting for the right night."
            action={
              <Link
                to="/app/library/planning"
                className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all duration-[300ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_20px_oklch(0.72_0.18_255/0.1)] active:scale-95 cursor-pointer"
              >
                Open queue <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {plan.map((m) => (
              <PlanningRow key={m.id} item={m} />
            ))}
          </div>
        </RevealSection>
      )}

      <PullQuote attribution="The shape of an archive">
        A library isn't what you've finished. It's the company you keep across years.
      </PullQuote>

      <RevealSection>
        <SectionHeader
          eyebrow="Recently"
          title="Recently Finished"
          subtitle="The stories you closed this season."
          action={
            <Link
              to="/app/library/recently-finished"
              className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all duration-[300ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_20px_oklch(0.72_0.18_255/0.1)] active:scale-95 cursor-pointer"
            >
              See timeline <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <RecentlyFinishedTimeline limit={8} />
      </RevealSection>

      {favs.length > 0 && (
        <RevealSection>
          <SectionHeader
            eyebrow="Favorites"
            title="The ones you'd live again"
            subtitle="Hand-picked from every medium."
            action={
              <Link
                to="/app/library/favorites"
                className="glass-subtle inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all duration-[300ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:text-foreground hover:shadow-[0_12px_24px_rgba(0,0,0,0.3),0_0_20px_oklch(0.72_0.18_255/0.1)] active:scale-95 cursor-pointer"
              >
                Open gallery <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <FavoritesGallery items={favs} />
        </RevealSection>
      )}

      <RevealSection>
        <SectionHeader
          eyebrow="Recent"
          title="Recently added"
          subtitle="Newest additions to your library."
        />
        <motion.div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 lg:-mx-10 lg:px-10">
          {recentlyAdded.map((m) => (
            <div key={m.id} className="snap-start w-44">
              <MediaCard item={m} size="md" />
            </div>
          ))}
        </motion.div>
      </RevealSection>

      <RevealSection>
        <MemoryHighlights />
      </RevealSection>

      <RevealSection>
        <RememberAgain />
      </RevealSection>

      <RevealSection>
        <SectionHeader
          eyebrow="Collections"
          title="Curated collections"
          subtitle="Editorial sets that map your taste."
        />
        <FeaturedCollections />
      </RevealSection>

      <RevealSection>
        <Link
          to="/app/library/all"
          className="glass group flex items-center justify-between gap-4 rounded-3xl p-6 transition hover-lift md:p-8"
        >
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.22em] text-primary/90">
              Master database
            </div>
            <div className="mt-2 font-display text-2xl tracking-tight md:text-3xl">
              All Library →
            </div>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Every item across every status, every type, every collection — with full search,
              filters and sort.
            </p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>
      </RevealSection>

      <RevealSection>{primaryGoal && <GoalCard goal={primaryGoal} />}</RevealSection>

      <RevealSection>
        <ComfortStories />
      </RevealSection>

      <RevealSection>
        <LibraryMap />
      </RevealSection>
    </div>
  );
}
