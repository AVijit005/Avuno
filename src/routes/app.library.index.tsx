import { useState, useRef, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, ChevronDown, Check, LayoutGrid, List } from "lucide-react";
import { useLibrary, useLibraryStats } from "@/hooks/use-library";
import { adaptLibraryItem } from "@/lib/adapters/media";
import { MediaCard } from "@/components/media/MediaCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app/library/")({
  component: LibraryIndex,
  pendingComponent: PageSkeleton,
});

type SortOption = "createdAt" | "rating" | "releaseYear";

function LibraryIndex() {
  const [mediaType, setMediaType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [favorite, setFavorite] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: stats } = useLibraryStats();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useLibrary({
      ...(mediaType !== "all" && { mediaType }),
      ...(status !== "all" && { status }),
      ...(favorite && { favorite: true }),
      sortBy,
      sortOrder,
      limit: 50,
    });

  const items = data?.pages.flatMap((p) => p.data).map(adaptLibraryItem) ?? [];

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const TAXONOMY = [
    { id: "all", label: "All" },
    { id: "movie", label: "Movies" },
    { id: "tvShow", label: "Series" },
    { id: "anime", label: "Anime" },
    { id: "book", label: "Books" },
    { id: "manga", label: "Manga" },
    { id: "game", label: "Games" },
    { id: "musicAlbum", label: "Music" },
    { id: "podcast", label: "Podcasts" },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-2 pb-24">
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats?.total
            ? `${stats.total.toLocaleString()} items in archive`
            : "Your master archive"}
        </p>
      </header>

      {/* TAXONOMY SEGMENTED CONTROL */}
      <div className="-mx-6 mb-8 overflow-x-auto px-6 pb-2 scrollbar-none md:-mx-0 md:px-0">
        <div className="flex w-max space-x-1 rounded-full bg-surface-1 p-1 ring-1 ring-border/40 shadow-sm">
          {TAXONOMY.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMediaType(tab.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                mediaType === tab.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mediaType === tab.id && (
                <motion.div
                  layoutId="active-taxonomy"
                  className="absolute inset-0 z-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search - Disabled per Phase 3 specs until backend supports it natively */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            disabled
            placeholder="Search library (Coming soon)..."
            className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="glass-subtle flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-hover hover:border-white/20">
              {status === "all" ? "Any Status" : status.replace("_", " ")}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                <DropdownMenuRadioItem value="all">Any Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="in_progress">In Progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="planning">Planning</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dropped">Dropped</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger className="glass-subtle flex h-10 w-10 items-center justify-center rounded-full transition-hover hover:border-white/20">
              <SlidersHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <DropdownMenuRadioItem value="createdAt">Date Added</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="releaseYear">Release Year</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
              >
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={favorite} onCheckedChange={setFavorite}>
                Favorites Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* MASTER GRID */}
      {isError ? (
        <EmptyState
          icon={<LayoutGrid />}
          title="Cannot load library"
          description="There was an error connecting to your archive."
          action={
            <button
              onClick={() => refetch()}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              Retry
            </button>
          }
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid />}
          title={
            status !== "all" || mediaType !== "all" || favorite
              ? "No matches found"
              : "Your library is empty"
          }
          description={
            status !== "all" || mediaType !== "all" || favorite
              ? "Try adjusting your filters to see more results."
              : "Start building your personal archive by adding your first story."
          }
          action={
            status !== "all" || mediaType !== "all" || favorite ? (
              <button
                onClick={() => {
                  setMediaType("all");
                  setStatus("all");
                  setFavorite(false);
                }}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
              >
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <div key={item.id} ref={isLast ? lastItemRef : null}>
                  <MediaCard item={item} />
                </div>
              );
            })}
          </div>
          {isFetchingNextPage && (
            <div className="mt-8 flex justify-center">
              <ShimmerSkeleton className="h-10 w-10 rounded-full" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
