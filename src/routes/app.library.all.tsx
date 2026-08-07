import type { UIMediaItem } from "@/lib/adapters/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { MediaCard } from "@/components/media/MediaCard";
import { LibraryToolbar, type SortKey } from "@/components/library/LibraryToolbar";
import { StatusBadge } from "@/components/library/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { metaOf, statusOf, type MediaStatus } from "@/lib/library";
import { snapshotAllItems } from "@/lib/store/libraryStore";
import type { MediaKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cascade } from "@/lib/motion";
import { useLibrary } from "@/hooks/use-library";
import { adaptLibraryItem } from "@/lib/adapters/media";

export const Route = createFileRoute("/app/library/all")({
  component: AllLibraryPage,
});

function AllLibraryPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MediaStatus[]>([]);
  const [kinds, setKinds] = useState<MediaKind[]>([]);
  const [favOnly, setFavOnly] = useState(false);
  const [journaledOnly, setJournaledOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("Recently Added");
  const [view, setView] = useState<"grid" | "rows">("grid");

  const { data: libraryData } = useLibrary({ limit: 100 });

  const items = useMemo(() => {
    const rawApiItems = libraryData?.pages.flatMap((page) => page.data.map(adaptLibraryItem)) ?? [];
    let r = rawApiItems.length > 0 ? rawApiItems : snapshotAllItems();
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter(
        (m) =>
          m.title.toLowerCase().includes(t) ||
          (m.creator?.toLowerCase().includes(t) ?? false) ||
          m.genres.some((g) => g.toLowerCase().includes(t)),
      );
    }
    if (status.length) r = r.filter((m) => status.includes(statusOf(m.id)));
    if (kinds.length) r = r.filter((m) => kinds.includes(m.kind as MediaKind));
    if (favOnly) r = r.filter((m) => metaOf(m.id).favorite);
    if (journaledOnly) r = r.filter((m) => Boolean(metaOf(m.id).journalExcerpt));

    switch (sort) {
      case "Alphabetical":
        r.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Rating":
        r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "Release Year":
        r.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "Personal Rating":
        r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "Most Time Spent":
        r.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
        break;
      case "Random":
        for (let i = r.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [r[i], r[j]] = [r[j], r[i]];
        }
        break;
      case "Recently Added":
        r.sort((a, b) => new Date(metaOf(b.id).addedAt ?? 0).getTime() - new Date(metaOf(a.id).addedAt ?? 0).getTime());
        break;
      case "Recently Finished":
        r.sort((a, b) => new Date(metaOf(b.id).completedAt ?? 0).getTime() - new Date(metaOf(a.id).completedAt ?? 0).getTime());
        break;
      default:
        break;
    }
    return r;
  }, [q, status, kinds, favOnly, journaledOnly, sort, libraryData]);

  const clearFilters = () => {
    setQ("");
    setStatus([]);
    setKinds([]);
    setFavOnly(false);
    setJournaledOnly(false);
  };

  return (
    <div className="pt-2">
      <div className="mb-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-primary/90">
          Master database
        </div>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">All Library</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every item — every status, every type, every collection.
        </p>
      </div>

      <LibraryToolbar
        q={q}
        onQ={setQ}
        status={status}
        onStatus={setStatus}
        kinds={kinds}
        onKinds={setKinds}
        favOnly={favOnly}
        onFavOnly={setFavOnly}
        journaledOnly={journaledOnly}
        onJournaledOnly={setJournaledOnly}
        sort={sort}
        onSort={setSort}
        view={view}
        onView={setView}
      />

      <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}
      </div>

      <motion.div
        key={view + sort + status.join(",") + kinds.join(",") + favOnly + journaledOnly}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={cn(
          view === "grid"
            ? "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "flex flex-col gap-3",
        )}
      >
        {items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="Nothing matches those filters"
              description="Try clearing a chip or changing the search."
              action={
                <button
                  onClick={clearFilters}
                  className="press-scale rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        ) : view === "grid" ? (
          items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={cascade(i)}
            >
              <MediaCard item={m as UIMediaItem} />
            </motion.div>
          ))
        ) : (
          items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={cascade(i)}
            >
              <Link
                to="/app/media/$id"
                params={{ id: m.id }}
                className="glass flex items-center gap-4 rounded-2xl p-3 transition hover-lift"
              >
                <motion.img
                  layoutId={`poster-${m.id}`}
                  src={m.poster || undefined}
                  alt=""
                  className="h-20 w-14 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{m.title}</span>
                    <StatusBadge status={statusOf(m.id)} size="xs" />
                  </div>
                  <div className="mt-0.5 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                    {m.year} · {m.kind} · {m.creator}
                  </div>
                </div>
                <div className="hidden text-xs text-muted-foreground md:block">
                  ★ {((m.rating ?? 0) ?? 0).toFixed(1)}
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
