import { Search, Filter, Grid3x3, Rows3, Heart, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TINT, type MediaStatus } from "@/lib/library";
import { KIND_LABEL, type MediaKind } from "@/lib/types";

const STATUSES: MediaStatus[] = [
  "in_progress",
  "completed",
  "planning",
  "paused",
  "dropped",
  "rewatching",
  "archived",
];
const KINDS: MediaKind[] = [
  "movie",
  "anime",
  "series",
  "book",
  "manga",
  "game",
  "music",
  "podcast",
  "course",
  "youtube",
];

const SORTS = [
  "Recently Added",
  "Recently Finished",
  "Alphabetical",
  "Rating",
  "Release Year",
  "Personal Rating",
  "Most Time Spent",
  "Random",
] as const;
export type SortKey = (typeof SORTS)[number];

interface Props {
  q: string;
  onQ: (v: string) => void;
  status: MediaStatus[];
  onStatus: (v: MediaStatus[]) => void;
  kinds: MediaKind[];
  onKinds: (v: MediaKind[]) => void;
  favOnly: boolean;
  onFavOnly: (v: boolean) => void;
  journaledOnly: boolean;
  onJournaledOnly: (v: boolean) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  view: "grid" | "rows";
  onView: (v: "grid" | "rows") => void;
}

export function LibraryToolbar(p: Props) {
  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="glass sticky top-[88px] z-20 -mx-6 mb-8 rounded-none px-6 py-3 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass-subtle inline-flex items-center gap-2 rounded-full px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            value={p.q}
            onChange={(e) => p.onQ(e.target.value)}
            placeholder="Search your library…"
            aria-label="Search your library"
            className="w-44 bg-transparent text-xs outline-none placeholder:text-muted-foreground sm:w-64"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => p.onFavOnly(!p.favOnly)}
            aria-pressed={p.favOnly}
            className={cn(
              "press-scale inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
              p.favOnly ? "bg-[var(--status-favorite)]/15 text-[var(--status-favorite)]" : "glass-subtle text-muted-foreground",
            )}
          >
            <Heart className="h-3 w-3" /> Favorites
          </button>
          <button
            onClick={() => p.onJournaledOnly(!p.journaledOnly)}
            aria-pressed={p.journaledOnly}
            className={cn(
              "press-scale inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
              p.journaledOnly ? "bg-primary/15 text-primary" : "glass-subtle text-muted-foreground",
            )}
          >
            <NotebookPen className="h-3 w-3" /> Journaled
          </button>
          <select
            value={p.sort}
            onChange={(e) => p.onSort(e.target.value as SortKey)}
            aria-label="Sort by"
            className="glass-subtle rounded-full bg-transparent px-3 py-1.5 text-xs"
          >
            {SORTS.map((s) => (
              <option key={s} value={s} className="bg-background">
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => p.onView("grid")}
            aria-pressed={p.view === "grid"}
            className={cn(
              "press-scale grid h-8 w-8 place-items-center rounded-full",
              p.view === "grid" ? "bg-white/[0.08]" : "text-muted-foreground",
            )}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => p.onView("rows")}
            aria-pressed={p.view === "rows"}
            className={cn(
              "press-scale grid h-8 w-8 place-items-center rounded-full",
              p.view === "rows" ? "bg-white/[0.08]" : "text-muted-foreground",
            )}
          >
            <Rows3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-2 overflow-x-auto pb-1"
        style={{
          maskImage: "linear-gradient(to right, black calc(100% - 32px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 32px), transparent 100%)",
        }}
      >
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {STATUSES.map((s) => {
          const active = p.status.includes(s);
          const tint = STATUS_TINT[s];
          return (
            <button
              key={s}
              onClick={() => p.onStatus(toggle(p.status, s))}
              aria-pressed={active}
              className="press-scale shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
              style={
                active
                  ? {
                      background: `color-mix(in oklab, ${tint} 18%, transparent)`,
                      borderColor: `color-mix(in oklab, ${tint} 45%, transparent)`,
                      color: `color-mix(in oklab, ${tint} 80%, oklch(0.97 0 0))`,
                    }
                  : {
                      background: "transparent",
                      borderColor: "oklch(1 0 0 / 0.1)",
                      color: "oklch(0.68 0.012 270)",
                    }
              }
            >
              {STATUS_LABEL[s]}
            </button>
          );
        })}
        <span className="mx-2 h-4 w-px shrink-0 bg-border" />
        {KINDS.map((k) => {
          const active = p.kinds.includes(k);
          return (
            <button
              key={k}
              onClick={() => p.onKinds(toggle(p.kinds, k))}
              aria-pressed={active}
              className={cn(
                "press-scale shrink-0 rounded-full border px-2.5 py-1 text-[11px]",
                active
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {KIND_LABEL[k]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
