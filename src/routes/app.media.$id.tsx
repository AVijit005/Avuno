import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMedia, useRelatedMedia } from "@/hooks/use-media";
import { useLibraryItem } from "@/hooks/use-library";
import { adaptMediaResponse, adaptLibraryItem } from "@/lib/adapters/media";
import type { UIMediaItem } from "@/lib/adapters/types";
import { CinematicHero } from "@/components/media-detail/CinematicHero";
import { ContinueExperience } from "@/components/media-detail/ContinueExperience";
import { PersonalMemory } from "@/components/media-detail/PersonalMemory";
import { MediaInformation } from "@/components/media-detail/MediaInformation";
import { MediaTimelinePreview } from "@/components/media-detail/MediaTimelinePreview";
import { MediaJournalPreview } from "@/components/media-detail/MediaJournalPreview";
import { MediaCollections } from "@/components/media-detail/MediaCollections";
import { MediaStatistics } from "@/components/media-detail/MediaStatistics";
import { Chapter } from "@/components/media-detail/Chapter";
import { ChapterNav } from "@/components/media-detail/ChapterNav";
import { MemorySummary } from "@/components/memory/MemorySummary";
import { MemoryJourney } from "@/components/memory/MemoryJourney";
import { MemoryConnections } from "@/components/memory/MemoryConnections";
import { BecauseYouLoved } from "@/components/discovery/BecauseYouLoved";
import { GoalCard } from "@/components/goals/GoalCard";
import { getRelatedGoal } from "@/lib/goals";
import { StoryUniverse } from "@/components/intelligence/StoryUniverse";
import { StoryDNA } from "@/components/intelligence/StoryDNA";
import { JourneyContinuity } from "@/components/intelligence/JourneyContinuity";
import { LivingHeaderMeta } from "@/components/media/LivingHeaderMeta";
import { StoryJourney } from "@/components/media/StoryJourney";
import { MemoryLayer } from "@/components/media/MemoryLayer";
import { EmotionJourney } from "@/components/media/EmotionJourney";
import { FavoriteMoments as MediaFavoriteMoments } from "@/components/media/FavoriteMoments";
import { CharactersYouLoved } from "@/components/media/CharactersYouLoved";
import { WhyItWorked } from "@/components/media/WhyItWorked";
import { SimilarMemories } from "@/components/media/SimilarMemories";
import { JournalIntegration } from "@/components/media/JournalIntegration";
import { CollectionsIntegration } from "@/components/media/CollectionsIntegration";
import { EditorialStats } from "@/components/media/EditorialStats";
import { CompanionStories } from "@/components/media/CompanionStories";
import { LifeContext } from "@/components/media/LifeContext";
import { DiscussionNotes } from "@/components/media/DiscussionNotes";
import { RewatchIntelligence } from "@/components/media/RewatchIntelligence";
import { CompletionReflection } from "@/components/media/CompletionReflection";
import { SessionHistory } from "@/components/media/SessionHistory";
import { MediaRelationships } from "@/components/media/MediaRelationships";
import { EditorialFooter } from "@/components/media/EditorialFooter";
import { RelationshipPanel } from "@/components/profile/RelationshipPanel";
import { MediaReflectionPanel } from "@/components/memory/YourReflectionsRail";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";

export const Route = createFileRoute("/app/media/$id")({
  component: MediaDetailPage,
});

const CHAPTERS = [
  { id: "ch-story", label: "Story" },
  { id: "ch-memory", label: "Memory" },
  { id: "ch-reflection", label: "Reflection" },
  { id: "ch-connections", label: "Connections" },
  { id: "ch-journey", label: "Journey" },
  { id: "ch-archive", label: "Archive" },
];

function MediaDetailPage() {
  const { id } = Route.useParams();
  const { data: mediaData, isLoading, isError } = useMedia(id);

  if (isLoading) {
    return (
      <div className="-mt-3 space-y-8">
        <ShimmerSkeleton className="h-[60vh] rounded-b-[40px]" />
        <div className="space-y-4 px-4">
          <ShimmerSkeleton className="h-12 w-64 rounded-2xl" />
          <ShimmerSkeleton className="h-8 w-96 rounded-xl" />
          <ShimmerSkeleton className="h-48 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ShimmerSkeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <ShimmerSkeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !mediaData) {
    return (
      <div className="-mt-3">
        <PremiumErrorState
          title="Media not found"
          description="This media item may have been removed or you don't have access."
        />
      </div>
    );
  }

  const item = adaptMediaResponse(mediaData);
  return <MediaDetailContent item={item} />;
}

function MediaDetailContent({ item }: { item: UIMediaItem }) {
  return (
    <div className="-mt-3">
      <ChapterNav chapters={CHAPTERS} title={item.title} />

      <Link
        to="/app/library"
        className="story-link mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to your archive
      </Link>

      <CinematicHero item={item} />
      <LivingHeaderMeta item={item} />

      {/* ───── Chapter 01 — Story (cinematic) ─────────────────────────── */}
      <Chapter
        id="ch-story"
        number="01"
        eyebrow="Chapter one"
        title="The story, in your hands"
        description="What it is, where you are with it, and how to step back in."
        tone="cinematic"
        accent={item.accent ?? undefined}
      >
        <ContinueExperience item={item} />
        <MediaInformation item={item} />
        <StoryJourney item={item} />
      </Chapter>

      {/* ───── Chapter 02 — Memory (journal) ──────────────────────────── */}
      <Chapter
        id="ch-memory"
        number="02"
        eyebrow="Chapter two"
        title="What it became to you"
        description="The line, the moments, the people, the feeling."
        tone="journal"
      >
        <PersonalMemory item={item} />
        <MediaReflectionPanel id={item.id} />
        <MemorySummary mediaId={item.id} />
        <MemoryLayer item={item} />
        <EmotionJourney item={item} />
        <MediaFavoriteMoments item={item} />
        <CharactersYouLoved item={item} />
      </Chapter>

      {/* ───── Chapter 03 — Reflection (essay) ────────────────────────── */}
      <Chapter
        id="ch-reflection"
        number="03"
        eyebrow="Chapter three"
        title="Why it worked for you"
        description="The quiet shape of what this story did."
        tone="essay"
      >
        <WhyItWorked item={item} />
        <CompletionReflection item={item} />
        <LifeContext item={item} />
      </Chapter>

      {/* ───── Chapter 04 — Connections (diagram) ─────────────────────── */}
      <Chapter
        id="ch-connections"
        number="04"
        eyebrow="Chapter four"
        title="Where it lives in your world"
        description="The collections, journal entries, and stories it touches."
        tone="diagram"
        accent={item.accent ?? undefined}
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <CollectionsIntegration item={item} />
          <JournalIntegration item={item} />
        </div>
        <MediaCollections item={item} />
        <SimilarMemories item={item} />
        <CompanionStories item={item} />
        <MediaRelationships item={item} />
        <RelationshipPanel kind="media" id={item.id} title="Across your Chronicle" />
      </Chapter>

      {/* ───── Chapter 05 — Journey (timeline) ────────────────────────── */}
      <Chapter
        id="ch-journey"
        number="05"
        eyebrow="Chapter five"
        title="Your journey through it"
        description="History, sessions, and what's still ahead."
        tone="timeline"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <MediaTimelinePreview item={item} />
          <MediaJournalPreview item={item} />
        </div>
        <RewatchIntelligence item={item} />
        <BecauseYouLoved anchorId={item.id} />
        {getRelatedGoal(item.id) && <GoalCard goal={getRelatedGoal(item.id)!} />}
      </Chapter>

      {/* ───── Chapter 06 — Archive (technical) ───────────────────────── */}
      <Chapter
        id="ch-archive"
        number="06"
        eyebrow="Chapter six"
        title="The archive"
        description="The deeper record — open when you want it."
        tone="technical"
        collapsible
        defaultOpen={false}
      >
        <StoryUniverse mediaId={item.id} />
        <StoryDNA mediaId={item.id} />
        <JourneyContinuity mediaId={item.id} />
        <EditorialStats item={item} />
        <MediaStatistics item={item} />
        <SessionHistory item={item} />
        <DiscussionNotes item={item} />
      </Chapter>

      <EditorialFooter />

      <div className="h-24" />
    </div>
  );
}
