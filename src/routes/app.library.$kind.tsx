import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MediaCard } from "@/components/media/MediaCard";
import { KIND_LABEL, type MediaKind } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { cascade } from "@/lib/motion";
import { useLibraryByType } from "@/hooks/use-library";
import { Search } from "lucide-react";

const KINDS = new Set<MediaKind>([
  "movie",
  "series",
  "anime",
  "book",
  "manga",
  "game",
  "music",
  "podcast",
  "course",
  "youtube",
]);

export const Route = createFileRoute("/app/library/$kind")({
  loader: ({ params }) => {
    if (!KINDS.has(params.kind as MediaKind)) throw notFound();
    return { kind: params.kind as MediaKind };
  },
  component: LibraryKind,
});

function LibraryKind() {
  const data = Route.useLoaderData() as { kind: MediaKind };
  const kind = data.kind;
  const { data: libraryData, isLoading } = useLibraryByType(kind);
  const items = libraryData?.pages.flatMap(p => p.data) || [];
  return (
    <div className="pt-2">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary">Library</div>
          <h1 className="mt-2 font-display text-4xl tracking-tight">{KIND_LABEL[kind]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} items in your collection.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={`No ${KIND_LABEL[kind].toLowerCase()} yet`}
          description="When you add something here, it'll appear with all the cinematic care it deserves."
          icon={<Search className="h-6 w-6 text-muted-foreground" />}
          action={
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, key: 'k' }))}
              className="press-scale rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Search to add
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={cascade(i)}
            >
              <MediaCard item={m.media as unknown as UIMediaItem} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
