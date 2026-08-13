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
import { LivingHeaderMeta } from "@/components/media/LivingHeaderMeta";
import { JournalIntegration } from "@/components/media/JournalIntegration";
import { CollectionsIntegration } from "@/components/media/CollectionsIntegration";
import { EditorialFooter } from "@/components/media/EditorialFooter";
import { MediaMemoriesPanel } from "@/components/memory/MediaMemoriesPanel";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";

export const Route = createFileRoute("/app/media/$id")({
  component: MediaDetailPage,
});

const CHAPTERS = [
  { id: "ch-story", label: "Story" },
  { id: "ch-memory", label: "Memory" },
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
        className="glass-subtle mb-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] active:scale-[0.95] transition-all"
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
        <MediaMemoriesPanel item={item} />
      </Chapter>

      <Chapter
        id="ch-connections"
        number="03"
        eyebrow="Chapter three"
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
      </Chapter>

      {/* ───── Chapter 05 — Journey (timeline) ────────────────────────── */}
      <Chapter
        id="ch-journey"
        number="04"
        eyebrow="Chapter four"
        title="Your journey through it"
        description="History, sessions, and what's still ahead."
        tone="timeline"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <MediaTimelinePreview item={item} />
          <MediaJournalPreview item={item} />
        </div>
      </Chapter>

      {/* ───── Chapter 06 — Archive (technical) ───────────────────────── */}
      <Chapter
        id="ch-archive"
        number="05"
        eyebrow="Chapter five"
        title="The archive"
        description="The deeper record — open when you want it."
        tone="technical"
        collapsible
        defaultOpen={false}
      >
        <MediaStatistics item={item} />
      </Chapter>

      <EditorialFooter />

      <div className="h-24" />
    </div>
  );
}
