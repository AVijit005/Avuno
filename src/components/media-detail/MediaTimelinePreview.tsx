import { motion } from "motion/react";
import { Play, Pause, RotateCcw, Check, NotebookPen, FolderPlus, History } from "lucide-react";
import type { UIMediaItem } from "@/lib/adapters/types";
import { useTimelineEvents, useMemories } from "@/hooks/use-journal";
import { adaptTimelineEvent } from "@/lib/adapters/journal";

const ICONS: Record<string, typeof Play> = {
  STARTED: Play,
  PAUSED: Pause,
  CONTINUED: RotateCcw,
  COMPLETED: Check,
  JOURNAL: NotebookPen,
  COLLECTION: FolderPlus,
  REWATCHED: RotateCcw,
  REREAD: RotateCcw,
  REPLAYED: RotateCcw,
  FAVORITED: Check,
  RATED: Check,
  MEMORY_CREATED: NotebookPen,
  JOURNAL_CREATED: NotebookPen,
  QUOTE_ADDED: NotebookPen,
  HIGHLIGHT_ADDED: NotebookPen,
};

export function MediaTimelinePreview({ item }: { item: UIMediaItem }) {
  const { data: timelineData, isLoading: isTimelineLoading } = useTimelineEvents();

  // We need to fetch memories for this media to deterministically match Memory-related timeline events
  const { data: memoriesData, isLoading: isMemoriesLoading } = useMemories({
    mediaId: item.mediaId,
  });

  const isLoading = isTimelineLoading || isMemoriesLoading;

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const allEvents = (timelineData?.items ?? []).map(adaptTimelineEvent);

  const memoryIds = new Set(memoriesData?.pages.flatMap((p) => p.items.map((m) => m.id)) ?? []);

  const mediaEvents = allEvents
    .filter((e) => {
      // Deterministic matching:
      // 1. Event metadata explicitly references this library item's ID
      if (e.metadata?.libraryId === item.id) return true;

      // 2. Event is explicitly linked to a memory that is attached to this media
      if (e.memoryId && memoryIds.has(e.memoryId)) return true;
      if (e.metadata?.memoryId && memoryIds.has(e.metadata.memoryId as string)) return true;

      return false;
    })
    .slice(0, 6);

  const recentEvents = mediaEvents.length > 0 ? mediaEvents : allEvents.slice(0, 3);
  const isFiltered = mediaEvents.length > 0;

  if (allEvents.length === 0) {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-primary ring-1 ring-white/10">
          <History className="h-4 w-4" />
        </span>
        No timeline events yet — activity will appear here as you track your journey.
      </div>
    );
  }

  return (
    <div className="relative">
      {!isFiltered && (
        <p className="mb-4 text-[11px] text-muted-foreground">Recent activity from your library</p>
      )}
      <span
        aria-hidden
        className="absolute left-[19px] top-2 bottom-2 w-px"
        style={{
          background: "linear-gradient(180deg, transparent, oklch(1 0 0 / 0.15), transparent)",
        }}
      />
      <ul className="space-y-3">
        {recentEvents.map((ev, i) => {
          const Icon = ICONS[ev.type] ?? Play;
          return (
            <motion.li
              key={ev.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center gap-4"
            >
              <div className="glass relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="glass-subtle flex-1 rounded-2xl px-4 py-3">
                <div className="text-sm">{ev.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(ev.eventDate).toLocaleDateString()}
                  {ev.description ? ` · ${ev.description}` : ""}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
