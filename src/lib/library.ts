// Library status taxonomy + selectors derived from live store.
import { type MediaItem, type MediaKind } from "@/lib/types";
import { useLibraryStore } from "@/lib/store/libraryStore";

export type MediaStatus =
  | "in_progress"
  | "completed"
  | "planning"
  | "paused"
  | "dropped"
  | "rewatching"
  | "archived";

export interface LibraryMeta {
  status: MediaStatus;
  favorite?: boolean;
  completedAt?: string;
  lastActivityAt?: string;
  timesWatched?: number;
  priority?: "high" | "med" | "low";
  reasonSaved?: string;
  droppedAtLabel?: string;
  addedAt?: string;
  journalExcerpt?: string;
}

function deriveStatus(m: MediaItem): MediaStatus {
  if (m.status === "completed") return "completed";
  if (m.status === "planned") return "planning";
  if (m.status === "paused") return "paused";
  return "in_progress";
}

function liveItems(): MediaItem[] {
  const custom = useLibraryStore.getState().customItems;
  return [...custom];
}

function liveMeta(id: string): Partial<LibraryMeta> {
  return useLibraryStore.getState().meta[id] ?? {};
}


export function metaOf(id: string): LibraryMeta {
  const all = liveItems();
  const m = all.find((x) => x.id === id);
  const base: LibraryMeta = { status: m ? deriveStatus(m) : "in_progress" };
  return { ...base, ...liveMeta(id) } as LibraryMeta;
}

export function statusOf(id: string): MediaStatus {
  return metaOf(id).status;
}

export function byStatus(status: MediaStatus): MediaItem[] {
  return liveItems().filter((m) => statusOf(m.id) === status);
}

export function inProgress() {
  return byStatus("in_progress");
}
export function continueJourney() {
  return byStatus("in_progress").sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
}
export function completed() {
  return byStatus("completed");
}
export function recentlyFinished() {
  return completed().slice();
}
export function planning() {
  return byStatus("planning");
}
export function paused() {
  return byStatus("paused");
}
export function dropped() {
  return byStatus("dropped");
}
export function rewatching() {
  return byStatus("rewatching");
}
export function archived() {
  return byStatus("archived");
}
export function favorites() {
  return liveItems().filter((m) => metaOf(m.id).favorite);
}

export function bucketOfDate(
  label?: string,
): "Today" | "Yesterday" | "Last Week" | "Last Month" | "Older" {
  if (!label) return "Older";
  const l = label.toLowerCase();
  if (l.includes("today")) return "Today";
  if (l.includes("yesterday")) return "Yesterday";
  if (l.includes("week")) return "Last Week";
  if (l.includes("month")) return "Last Month";
  return "Older";
}

export interface StatusCount {
  status: MediaStatus;
  count: number;
  trend: number;
}
export function statusCounts(): Record<MediaStatus, number> {
  const out = {
    in_progress: 0,
    completed: 0,
    planning: 0,
    paused: 0,
    dropped: 0,
    rewatching: 0,
    archived: 0,
  } as Record<MediaStatus, number>;
  liveItems().forEach((m) => {
    out[statusOf(m.id)] += 1;
  });
  return out;
}

export function trendFor(status: MediaStatus): number | null {
  return null;
}

export function collageRecent(n = 9): string[] {
  return liveItems()
    .slice(0, n)
    .map((m) => m.poster)
    .filter((p): p is string => !!p);
}

export function smartInsights(): string[] {
  return [];
}

// Status presentation tokens — emotional, not statistical.
export const STATUS_LABEL: Record<MediaStatus, string> = {
  in_progress: "In the middle",
  completed: "Stayed with you",
  planning: "Future adventure",
  paused: "Waiting for the right time",
  dropped: "Left behind",
  rewatching: "Returning to",
  archived: "Archived",
};

export const STATUS_TINT: Record<MediaStatus | "favorite", string> = {
  in_progress: "var(--status-in-progress)",
  completed: "var(--status-completed)",
  planning: "var(--status-planning)",
  paused: "var(--status-paused)",
  dropped: "var(--status-dropped)",
  rewatching: "var(--status-rewatching)",
  archived: "var(--status-archived)",
  favorite: "var(--status-favorite)",
};
