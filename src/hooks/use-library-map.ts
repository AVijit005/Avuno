import { useMemo } from "react";
import { useLibraryStore } from "@/lib/store/libraryStore";
import type { MediaItem } from "@/lib/types";
import type { StoredMeta } from "@/lib/store/libraryStore";
import type { MediaStatus } from "@/lib/library";

interface LibraryEntry {
  item: MediaItem;
  meta: StoredMeta;
}

export function useLibraryMap(): Map<string, LibraryEntry> {
  const customItems = useLibraryStore((s) => s.customItems);
  const meta = useLibraryStore((s) => s.meta);

  return useMemo(() => {
    const map = new Map<string, LibraryEntry>();
    for (const item of customItems) {
      map.set(item.id, { item, meta: meta[item.id] ?? {} });
    }
    return map;
  }, [customItems, meta]);
}

export function useLibraryIndex(): {
  byId: Map<string, LibraryEntry>;
  byStatus: Map<MediaStatus, MediaItem[]>;
  all: LibraryEntry[];
} {
  const customItems = useLibraryStore((s) => s.customItems);
  const meta = useLibraryStore((s) => s.meta);

  return useMemo(() => {
    const byId = new Map<string, LibraryEntry>();
    const byStatus = new Map<MediaStatus, MediaItem[]>();
    const all: LibraryEntry[] = [];

    for (const item of customItems) {
      const itemMeta = meta[item.id] ?? {};
      const entry: LibraryEntry = { item, meta: itemMeta };
      byId.set(item.id, entry);
      all.push(entry);

      const status = (itemMeta.status ?? deriveStatus(item)) as MediaStatus;
      const existing = byStatus.get(status);
      if (existing) {
        existing.push(item);
      } else {
        byStatus.set(status, [item]);
      }
    }

    return { byId, byStatus, all };
  }, [customItems, meta]);
}

function deriveStatus(m: MediaItem): MediaStatus {
  if (m.status === "completed") return "completed";
  if (m.status === "planned") return "planning";
  if (m.status === "paused") return "paused";
  return "in_progress";
}

export function useLibraryMeta(id: string): StoredMeta | undefined {
  return useLibraryStore((s) => s.meta[id]);
}
