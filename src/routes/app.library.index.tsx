import { useState, useRef, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, ChevronDown, LayoutGrid } from "lucide-react";
import { useLibrary, useLibraryStats } from "@/hooks/use-library";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { adaptLibraryItem } from "@/lib/adapters/media";
import { MediaCard } from "@/components/media/MediaCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { useMediaActions } from "@/lib/store/MediaActionsContext";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { openAdd } = useMediaActions();

  // Keyboard friendly interaction for search
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: stats } = useLibraryStats();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useLibrary({
      ...(mediaType !== "all" && { mediaType }),
      ...(status !== "all" && { status }),
      ...(favorite && { favorite: true }),
      ...(debouncedSearch && { search: debouncedSearch }),
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
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats?.total
              ? `${stats.total.toLocaleString()} items in archive`
              : "Your master archive"}
          </p>
        </div>
        <button
          id="library-add-media-btn"
          onClick={openAdd}
          className="hidden sm:flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-[140ms] shadow-[0_4px_12px_-4px_oklch(0.72_0.18_255/0.6),inset_0_1px_0_oklch(1_1_1/0.2)] hover:bg-primary/90 hover:shadow-[0_6px_16px_-4px_oklch(0.72_0.18_255/0.7),inset_0_1px_0_oklch(1_1_1/0.25)] hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[1px]"
        >
          <span className="text-base leading-none">+</span>
          Add media
        </button>
      </header>

      {/* TAXONOMY SEGMENTED CONTROL */}
      <div className="-mx-4 sm:-mx-6 mb-8 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-none md:-mx-0 md:px-0">
        <div className="flex w-max space-x-1 rounded-2xl glass p-1 shadow-sm">
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
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your library (⌘F)..."
            className="h-11 w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] pl-9 pr-8 text-sm shadow-[inset_0_2px_4px_oklch(0_0_0/0.1)] placeholder:text-muted-foreground/60 hover:border-foreground/20 hover:bg-foreground/[0.05] focus:border-ring/50 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:bg-foreground/[0.05] transition-[border-color,background-color,box-shadow] duration-[140ms] ease-out"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
                searchInputRef.current?.blur();
              }
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="glass flex h-11 items-center gap-2 rounded-xl px-4 text-sm transition-all duration-[140ms] hover:bg-foreground/[0.08] hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[1px]">
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
            <DropdownMenuTrigger className="glass flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all duration-[140ms] hover:bg-foreground/[0.08] hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-[1px]">
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
              className="rounded-xl glass px-4 py-2 text-sm font-medium hover:bg-foreground/[0.08] hover:-translate-y-[1px] hover:shadow-md transition-all duration-[140ms] active:scale-[0.98]"
            >
              Retry
            </button>
          }
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="aspect-[2/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        status !== "all" || mediaType !== "all" || favorite || debouncedSearch ? (
          <EmptyState
            icon={<LayoutGrid />}
            title="No matches found"
            description="Try adjusting your filters or search query to see more results."
            action={
              <button
                onClick={() => {
                  setMediaType("all");
                  setStatus("all");
                  setFavorite(false);
                  setSearchTerm("");
                }}
                className="rounded-xl glass px-4 py-2 text-sm font-medium hover:bg-foreground/[0.08] hover:-translate-y-[1px] hover:shadow-md transition-all duration-[140ms] active:scale-[0.98]"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <div className="flex justify-center mt-12 md:mt-24">
            <div className="max-w-xl text-center md:text-left md:flex items-center gap-12 glass rounded-3xl p-8 md:p-12 shadow-lg ring-1 ring-white/5 relative overflow-hidden card-interactive">
              {/* Subtle background glow for empty state */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-medium tracking-tight">
                  The foundation of your story
                </h2>
                <div className="text-muted-foreground text-sm space-y-4">
                  <p>
                    Your library is where everything begins. Once you add media, it becomes the
                    engine for your:
                  </p>
                  <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-foreground/80 list-disc list-inside">
                    <li>Timeline</li>
                    <li>Journal</li>
                    <li>Memories</li>
                    <li>Analytics</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <PremiumButton variant="primary" onClick={openAdd}>
                    Add your first story
                  </PremiumButton>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
