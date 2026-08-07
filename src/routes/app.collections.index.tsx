import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { useState } from "react";
import { useCollections } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import { SectionHeader, RevealSection } from "@/components/dashboard/SectionHeader";
import { CollectionsHero } from "@/components/collections/CollectionsHero";
import { FeaturedCollections } from "@/components/collections/FeaturedCollections";
import { EditorialGrid } from "@/components/collections/EditorialGrid";
import { CreateCollectionFab } from "@/components/collections/CreateCollectionFab";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { MemoryCapsule } from "@/components/memory/MemoryCapsule";
import { CAPSULES } from "@/lib/memoryInsights";
import { DiscoveryCollections } from "@/components/discovery/DiscoveryCollections";
import { SmartCollectionCard } from "@/components/challenges/SmartCollectionCard";

import { RelatedJourney } from "@/components/intelligence/RelatedJourney";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";

export const Route = createFileRoute("/app/collections/")({
  component: CollectionsIndex,
  pendingComponent: PageSkeleton,
});

function CollectionsIndex() {
  const [open, setOpen] = useState(false);
  const { data: collections, isLoading } = useCollections();

  if (isLoading) {
    return (
      <div className="-mt-3 pb-24 space-y-8">
        <ShimmerSkeleton className="h-64 rounded-[40px]" />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const allCollections = collections?.map(adaptCollectionResponse) ?? [];
  const pinned = allCollections.filter((c) => c.isPinned);
  const recent = [...allCollections].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="-mt-3 pb-24">
      <CollectionsHero />

      <RevealSection>
        <SectionHeader
          eyebrow="Featured"
          title="Editor's shelves"
          subtitle="Larger-than-life collections worth opening tonight."
        />
        <FeaturedCollections />
      </RevealSection>

      {pinned.length > 0 && (
        <RevealSection>
          <SectionHeader eyebrow="Pinned" title="Always within reach" />
          <EditorialGrid collections={pinned} />
        </RevealSection>
      )}

      {recent.length > 0 && (
        <RevealSection>
          <SectionHeader eyebrow="Recent activity" title="Recently updated" />
          <EditorialGrid collections={recent} />
        </RevealSection>
      )}

      <RevealSection>
        <SectionHeader
          eyebrow="Memory"
          title="Memory capsules"
          subtitle="Periods and weekends grouped into one feeling."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPSULES.map((c) => (
            <MemoryCapsule key={c.id} capsule={c} />
          ))}
        </div>
      </RevealSection>

      <RevealSection>
        <SectionHeader eyebrow="Smart" title="Built from your patterns" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allCollections
            .slice(0, 6)
            .map((c) => (
              <SmartCollectionCard key={c.id} collection={c} />
            ))}
        </div>
      </RevealSection>

      <RevealSection>
        <DiscoveryCollections />
      </RevealSection>

      <RevealSection>
        <RelatedJourney mediaId="interstellar" />
      </RevealSection>

      <CreateCollectionFab onClick={() => setOpen(true)} />
      <CreateCollectionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
