import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, RefreshCcw, User, Share2, Heart, Pencil } from "lucide-react";
import { useCollection } from "@/hooks/use-collections";
import { adaptCollectionResponse } from "@/lib/adapters/collection";
import { useArtworkAccent } from "@/lib/useArtworkAccent";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PosterCard } from "@/components/ui/PosterCard";
import { CollectionToolbar, type ViewMode } from "@/components/collections/CollectionToolbar";
import { CollectionStatistics } from "@/components/collections/CollectionStatistics";
import { RelatedCollections } from "@/components/collections/RelatedCollections";
import { RevealSection } from "@/components/dashboard/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CollectionStory } from "@/components/collections/CollectionStory";
import { CollectionTimeline } from "@/components/collections/CollectionTimeline";
import { CollectionConnections } from "@/components/collections/CollectionConnections";
import { CollectionInsights } from "@/components/collections/CollectionInsights";
import { CollectionExplorer } from "@/components/collections/CollectionExplorer";
import { CollectionWorkspace } from "@/components/collections/CollectionWorkspace";
import { CollectionHeatmap } from "@/components/collections/CollectionHeatmap";
import { CollectionFingerprint } from "@/components/collections/CollectionFingerprint";
import { CollectionMoodboard } from "@/components/collections/CollectionMoodboard";
import { CollectionChapters } from "@/components/collections/CollectionChapters";
import { SmartCollectionSuggestions } from "@/components/collections/SmartCollectionSuggestions";
import { CollectionAchievements } from "@/components/collections/CollectionAchievements";
import { CollectionJournal } from "@/components/collections/CollectionJournal";
import { CollectionDiscussions } from "@/components/collections/CollectionDiscussions";
import { CollectionAnalyticsPreview } from "@/components/collections/CollectionAnalyticsPreview";
import { CompanionCollections } from "@/components/collections/CompanionCollections";
import { CuratorNotes } from "@/components/collections/CuratorNotes";
import { CollectionFooter } from "@/components/collections/CollectionFooter";
import { CollectionQuickActions } from "@/components/collections/CollectionQuickActions";

import { Chapter } from "@/components/media-detail/Chapter";
import { DropCap } from "@/components/editorial/DropCap";
import { PullQuote } from "@/components/editorial/PullQuote";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { PremiumErrorState } from "@/components/common/PremiumErrorState";
import type { UICollection } from "@/lib/adapters/types";

export const Route = createFileRoute("/app/collections/$id")({
  component: CollectionDetail,
});

function CollectionDetail() {
  const { id } = Route.useParams();
  const { data: collectionData, isLoading, isError } = useCollection(id);

  if (isLoading) {
    return (
      <div className="-mt-3 pb-24 space-y-8">
        <ShimmerSkeleton className="h-[44vh] min-h-[360px] rounded-[40px]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !collectionData) {
    return (
      <div className="-mt-3 pb-24">
        <PremiumErrorState
          title="Collection not found"
          description="This collection may have been deleted or you don't have access."
        />
      </div>
    );
  }

  const c = adaptCollectionResponse(collectionData);
  return <CollectionDetailContent collection={c} />;
}

function CollectionDetailContent({ collection: c }: { collection: UICollection }) {
  const accent = useArtworkAccent(c.color ?? undefined);
  const [view, setView] = useState<ViewMode>("editorial");
  const [q, setQ] = useState("");

  // Derive media items from collection items
  const items = useMemo(() => {
    return (c.items ?? []).map((item) => ({
      id: item.mediaId,
      title: item.title,
      poster: item.posterUrl ?? "",
      kind: item.mediaType as string,
      year: 0,
      rating: 0,
      creator: "",
      synopsis: "",
    }));
  }, [c.items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((m) => m.title.toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div className="-mt-3 pb-24">
      <Link
        to="/app/collections"
        className="story-link mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All collections
      </Link>

      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[40px]"
        style={{ ...accent.style, boxShadow: "0 60px 140px -40px oklch(0 0 0 / 0.7)" }}
      >
        <div className="relative h-[44vh] min-h-[360px]">
          {c.items && c.items.length >= 4 ? (
            <div className="absolute inset-0 grid grid-cols-4">
              {c.items.slice(0, 4).map((item, i) => (
                <motion.img
                  key={i}
                  src={item.posterUrl ?? ""}
                  alt=""
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1.02 }}
                  transition={{ delay: 0.05 * i, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full object-cover"
                />
              ))}
            </div>
          ) : (
            <img src={c.cover ?? ""} alt="" className="h-full w-full object-cover" />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `linear-gradient(115deg, oklch(0.1 0.02 270 / 0.92) 0%, transparent 78%)`,
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-end p-7 md:p-14 lg:p-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative max-w-2xl overflow-hidden rounded-3xl p-6 md:p-8"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.4), transparent)",
              }}
            />
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/70">
              {c.visibility}
            </div>
            <h1 className="mt-2 font-display text-5xl leading-[1.02] tracking-tight text-white md:text-6xl">
              {c.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">{c.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Created{" "}
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCcw className="h-3.5 w-3.5" /> Updated{" "}
                {new Date(c.updatedAt).toLocaleDateString()}
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                {c.itemCount} items
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <PremiumButton
                variant="primary"
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => toast.info("Collection editing coming soon.")}
              >
                Edit collection
              </PremiumButton>
              <PremiumButton
                variant="secondary"
                icon={<Share2 className="h-4 w-4" />}
                onClick={() => toast.info("Sharing coming soon.")}
              >
                Share
              </PremiumButton>
              <PremiumButton variant="secondary" icon={<Heart className="h-4 w-4" />}>
                Save
              </PremiumButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="mt-8">
        <CollectionToolbar view={view} onView={setView} query={q} onQuery={setQ} />
      </div>

      {/* Grid */}
      <RevealSection>
        {filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Nothing in this collection matches your search yet."
          />
        ) : (
          <motion.div
            layout
            className={
              view === "list"
                ? "flex flex-col gap-2"
                : view === "compact"
                  ? "grid grid-cols-3 gap-3 md:grid-cols-6 lg:grid-cols-8"
                  : view === "editorial"
                    ? "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5"
                    : "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6"
            }
          >
            {filtered.map((m) =>
              view === "list" ? (
                <Link
                  key={m.id}
                  to="/app/media/$id"
                  params={{ id: m.id }}
                  className="glass flex items-center gap-4 rounded-2xl p-3 hover-lift"
                >
                  <img
                    src={m.poster}
                    alt=""
                    className="h-14 w-10 rounded-md object-cover ring-1 ring-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{m.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.kind}</div>
                  </div>
                </Link>
              ) : (
                <div key={m.id} className="glass rounded-2xl overflow-hidden">
                  <img src={m.poster} alt={m.title} className="w-full aspect-[2/3] object-cover" />
                  <div className="p-3">
                    <div className="truncate text-sm">{m.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.kind}</div>
                  </div>
                </div>
              ),
            )}
          </motion.div>
        )}
      </RevealSection>

      <CollectionQuickActions collection={c as never} />

      {/* ───── Chapter 01 — Curator note ────────────────────── */}
      <Chapter
        id="ch-curator"
        number="01"
        eyebrow="Curator's note"
        title="Why this shelf exists"
        tone="essay"
        accent={c.color ?? undefined}
      >
        <DropCap>{c.description ?? "A collection of stories."}</DropCap>
        <CuratorNotes collection={c as never} />
      </Chapter>

      <CollectionFooter />
    </div>
  );
}
