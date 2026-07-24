// Reactive library store — Zustand + localStorage. Frontend-only source of truth.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type MediaItem, type MediaKind } from "@/lib/types";
import type { LibraryMeta, MediaStatus } from "@/lib/library";

export interface ProgressEntry {
  at: string;
  pct: number;
  note?: string;
  label?: string;
}
export interface UserQuote {
  id: string;
  text: string;
  refId?: string;
  refTitle?: string;
  accent?: string;
  at: string;
}

export interface StoredMeta extends LibraryMeta {
  progress?: number; // 0–100
  progressLabel?: string; // "Ep 7", "Page 142", etc.
  rating?: number; // user 0–5
  tags?: string[];
  shelfIds?: string[];
  collectionIds?: string[];
  progressLog?: ProgressEntry[];
  mood?: string;
  reflection?: string;
}

interface State {
  meta: Record<string, StoredMeta>;
  customItems: MediaItem[];
  shelves: { id: string; name: string; accent?: string; itemIds: string[] }[];
  collections: {
    id: string;
    name: string;
    note?: string;
    accent?: string;
    cover?: string;
    itemIds: string[];
    pinned?: boolean;
    favorite?: boolean;
  }[];
  userQuotes: UserQuote[];
  hydrated: boolean;
}

interface Actions {
  setStatus: (id: string, status: MediaStatus) => void;
  toggleFavorite: (id: string) => void;
  logProgress: (id: string, pct: number, note?: string, label?: string) => void;
  incrementRewatch: (id: string) => void;
  setPriority: (id: string, p: "high" | "med" | "low") => void;
  addTag: (id: string, tag: string) => void;
  setReflection: (
    id: string,
    mood: string | undefined,
    reflection: string | undefined,
    rating?: number,
  ) => void;
  addCustomItem: (item: MediaItem, initial?: Partial<StoredMeta>) => void;
  removeItem: (id: string) => void;
  bulkSetStatus: (ids: string[], status: MediaStatus) => void;
  // Shelves
  createShelf: (name: string, accent?: string) => string;
  renameShelf: (id: string, name: string) => void;
  deleteShelf: (id: string) => void;
  toggleShelfItem: (shelfId: string, itemId: string) => void;
  // Collections (user-owned)
  createCollection: (name: string, note?: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  toggleCollectionItem: (collectionId: string, itemId: string) => void;
  setCollectionMeta: (
    id: string,
    patch: Partial<{
      note: string;
      accent: string;
      cover: string;
      pinned: boolean;
      favorite: boolean;
    }>,
  ) => void;
  // Quotes (user-saved)
  addUserQuote: (text: string, ref?: { id?: string; title?: string; accent?: string }) => string;
  removeUserQuote: (id: string) => void;
  // I/O
  importJSON: (data: unknown) => { added: number; updated: number };
  exportJSON: () => string;
  reset: () => void;
}

const SEED_META: Record<string, StoredMeta> = {};

function deriveDefault(m: MediaItem): MediaStatus {
  if (m.status === "completed") return "completed";
  if (m.status === "planned") return "planning";
  if (m.status === "paused") return "paused";
  return "in_progress";
}

const initialMeta = (): Record<string, StoredMeta> => {
  return {};
};

export const useLibraryStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      meta: initialMeta(),
      customItems: [],
      shelves: [],
      collections: [],
      userQuotes: [],
      hydrated: false,

      setStatus: (id, status) =>
        set((s) => {
          const prev = s.meta[id] ?? { status };
          const next: StoredMeta = { ...prev, status, lastActivityAt: "Just now" };
          if (status === "completed") {
            next.completedAt = "Today";
            next.progress = 100;
          }
          if (status === "rewatching") {
            next.progress = 0;
            next.timesWatched = (prev.timesWatched ?? 0) + 1;
          }
          return { meta: { ...s.meta, [id]: next } };
        }),
      toggleFavorite: (id) =>
        set((s) => ({
          meta: {
            ...s.meta,
            [id]: { ...(s.meta[id] ?? { status: "in_progress" }), favorite: !s.meta[id]?.favorite },
          },
        })),
      logProgress: (id, pct, note, label) =>
        set((s) => {
          const prev = s.meta[id] ?? { status: "in_progress" as MediaStatus };
          const entry: ProgressEntry = { at: new Date().toISOString(), pct, note, label };
          const log = [...(prev.progressLog ?? []), entry].slice(-50);
          const status: MediaStatus =
            pct >= 100 ? "completed" : prev.status === "planning" ? "in_progress" : prev.status;
          return {
            meta: {
              ...s.meta,
              [id]: {
                ...prev,
                status,
                progress: pct,
                progressLabel: label ?? prev.progressLabel,
                lastActivityAt: "Just now",
                progressLog: log,
                ...(pct >= 100 ? { completedAt: "Today" } : {}),
              },
            },
          };
        }),
      incrementRewatch: (id) =>
        set((s) => {
          const prev = s.meta[id] ?? { status: "rewatching" as MediaStatus };
          return {
            meta: {
              ...s.meta,
              [id]: {
                ...prev,
                status: "rewatching",
                progress: 0,
                timesWatched: (prev.timesWatched ?? 0) + 1,
                lastActivityAt: "Just now",
              },
            },
          };
        }),
      setPriority: (id, p) =>
        set((s) => ({
          meta: { ...s.meta, [id]: { ...(s.meta[id] ?? { status: "planning" }), priority: p } },
        })),
      addTag: (id, tag) =>
        set((s) => {
          const prev = s.meta[id] ?? { status: "in_progress" as MediaStatus };
          const tags = Array.from(new Set([...(prev.tags ?? []), tag]));
          return { meta: { ...s.meta, [id]: { ...prev, tags } } };
        }),
      setReflection: (id, mood, reflection, rating) =>
        set((s) => {
          const prev = s.meta[id] ?? { status: "completed" as MediaStatus };
          return {
            meta: { ...s.meta, [id]: { ...prev, mood, reflection, rating: rating ?? prev.rating } },
          };
        }),
      addCustomItem: (item, initial) =>
        set((s) => ({
          customItems: [item, ...s.customItems.filter((x) => x.id !== item.id)],
          meta: {
            ...s.meta,
            [item.id]: { status: "planning", addedAt: "Just now", ...initial } as StoredMeta,
          },
        })),
      removeItem: (id) =>
        set((s) => {
          const m = { ...s.meta };
          delete m[id];
          return {
            meta: m,
            customItems: s.customItems.filter((x) => x.id !== id),
            shelves: s.shelves.map((sh) => ({
              ...sh,
              itemIds: sh.itemIds.filter((x) => x !== id),
            })),
            collections: s.collections.map((c) => ({
              ...c,
              itemIds: c.itemIds.filter((x) => x !== id),
            })),
          };
        }),
      bulkSetStatus: (ids, status) =>
        set((s) => {
          const meta = { ...s.meta };
          for (const id of ids) {
            const prev = meta[id] ?? { status };
            meta[id] = {
              ...prev,
              status,
              lastActivityAt: "Just now",
              ...(status === "completed" ? { completedAt: "Today", progress: 100 } : {}),
            };
          }
          return { meta };
        }),

      createShelf: (name, accent) => {
        const id = `shelf_${Date.now().toString(36)}`;
        set((s) => ({ shelves: [...s.shelves, { id, name, accent, itemIds: [] }] }));
        return id;
      },
      renameShelf: (id, name) =>
        set((s) => ({ shelves: s.shelves.map((x) => (x.id === id ? { ...x, name } : x)) })),
      deleteShelf: (id) => set((s) => ({ shelves: s.shelves.filter((x) => x.id !== id) })),
      toggleShelfItem: (shelfId, itemId) =>
        set((s) => ({
          shelves: s.shelves.map((sh) =>
            sh.id !== shelfId
              ? sh
              : {
                  ...sh,
                  itemIds: sh.itemIds.includes(itemId)
                    ? sh.itemIds.filter((x) => x !== itemId)
                    : [itemId, ...sh.itemIds],
                },
          ),
        })),

      createCollection: (name, note) => {
        const id = `col_${Date.now().toString(36)}`;
        set((s) => ({ collections: [{ id, name, note, itemIds: [] }, ...s.collections] }));
        return id;
      },
      renameCollection: (id, name) =>
        set((s) => ({ collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)) })),
      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),
      toggleCollectionItem: (collectionId, itemId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id !== collectionId
              ? c
              : {
                  ...c,
                  itemIds: c.itemIds.includes(itemId)
                    ? c.itemIds.filter((x) => x !== itemId)
                    : [itemId, ...c.itemIds],
                },
          ),
        })),
      setCollectionMeta: (id, patch) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      addUserQuote: (text, ref) => {
        const id = `uq_${Date.now().toString(36)}`;
        set((s) => ({
          userQuotes: [
            {
              id,
              text,
              refId: ref?.id,
              refTitle: ref?.title,
              accent: ref?.accent,
              at: new Date().toISOString(),
            },
            ...s.userQuotes,
          ].slice(0, 500),
        }));
        return id;
      },
      removeUserQuote: (id) =>
        set((s) => ({ userQuotes: s.userQuotes.filter((q) => q.id !== id) })),

      importJSON: (data) => {
        let added = 0,
          updated = 0;
        if (!data || typeof data !== "object") return { added: 0, updated: 0 };
        const d = data as Partial<State>;
        set((s) => {
          const meta = { ...s.meta };
          if (d.meta)
            for (const [id, m] of Object.entries(d.meta)) {
              if (meta[id]) updated++;
              else added++;
              meta[id] = { ...meta[id], ...m } as StoredMeta;
            }
          const customItems = [...s.customItems];
          if (Array.isArray(d.customItems))
            for (const it of d.customItems) {
              if (!customItems.find((x) => x.id === it.id)) {
                customItems.unshift(it);
                added++;
              }
            }
          return {
            meta,
            customItems,
            shelves: Array.isArray(d.shelves) ? d.shelves : s.shelves,
            collections: Array.isArray(d.collections) ? d.collections : s.collections,
            userQuotes: Array.isArray(d.userQuotes) ? d.userQuotes : s.userQuotes,
          };
        });
        return { added, updated };
      },
      exportJSON: () => {
        const { meta, customItems, shelves, collections, userQuotes } = get();
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            meta,
            customItems,
            shelves,
            collections,
            userQuotes,
          },
          null,
          2,
        );
      },
      reset: () =>
        set({ meta: initialMeta(), customItems: [], shelves: [], collections: [], userQuotes: [] }),
    }),
    {
      name: "chronicle:library:v2",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
              length: 0,
              clear: () => undefined,
              key: () => null,
            } satisfies Storage),
      ),
      partialize: (s) => ({
        meta: s.meta,
        customItems: s.customItems,
        shelves: s.shelves,
        collections: s.collections,
        userQuotes: s.userQuotes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

// Convenience selectors (non-reactive snapshot for legacy callers).
export function snapshotMeta(id: string): StoredMeta {
  const s = useLibraryStore.getState();
  return s.meta[id] ?? { status: "in_progress" };
}

export function snapshotAllItems(): MediaItem[] {
  return [...useLibraryStore.getState().customItems];
}

export const KIND_LABEL: Record<MediaKind | "article", string> = {
  movie: "Movie",
  series: "Series",
  anime: "Anime",
  book: "Book",
  manga: "Manga",
  game: "Game",
  music: "Album",
  podcast: "Podcast",
  course: "Course",
  youtube: "Video",
  article: "Article",
};

