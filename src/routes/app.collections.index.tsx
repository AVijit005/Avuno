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
import { DiscoveryCollections } from "@/components/discovery/DiscoveryCollections";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, LibrarySquare } from "lucide-react";

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
    <div className="pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border/40 pb-6 pt-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Curated Organization
          </div>
          <h1 className="font-display text-4xl tracking-tight">Collections</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Group your media into intentional spaces. Share them, track them, or keep them private.
          </p>
        </div>
      </div>

      {allCollections.length === 0 ? (
        <EmptyState
          icon={<LibrarySquare />}
          title="No collections yet"
          description="Create your first collection to start organizing your movies, shows, and books into intentional spaces."
          action={
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-12">
            <SectionHeader eyebrow="Workspace" title="Featured Collections" />
            <FeaturedCollections />
          </div>

          {pinned.length > 0 && (
            <div className="mb-12">
              <SectionHeader eyebrow="Pinned" title="Always within reach" />
              <EditorialGrid collections={pinned} />
            </div>
          )}

          {recent.length > 0 && (
            <div className="mb-12">
              <SectionHeader eyebrow="Recent activity" title="Recently updated" />
              <EditorialGrid collections={recent} />
            </div>
          )}

          <RevealSection>
            <DiscoveryCollections />
          </RevealSection>
        </>
      )}

      <CreateCollectionFab onClick={() => setOpen(true)} />
      <CreateCollectionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
