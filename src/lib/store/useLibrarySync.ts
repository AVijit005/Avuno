import { useCallback } from "react";
import { toast } from "sonner";
import { useUpdateLibraryItem } from "@/hooks/use-library";
import { useLibraryStore, snapshotAllItems } from "@/lib/store/libraryStore";
import { adaptStatusToBackend } from "@/lib/adapters/status";
import type { MediaStatus } from "@/lib/library";
import type { UpdateLibraryItemInput } from "@/lib/api/library";

/**
 * Bridges the local library store to the server.
 *
 * Every write the UI performed — status changes, favourites, progress,
 * reflections, rewatch counts — went only to `localStorage` via the Zustand
 * store. Reads came from the API. The two never met, so anything a user
 * recorded vanished on logout, on a browser-data clear, and on any other
 * device; newly added items never appeared in the library, dashboard or
 * analytics because those surfaces read from the server.
 *
 * The store is kept as an optimistic cache rather than removed: it is
 * synchronous, ~40 components read it directly, and it is what makes the UI
 * feel instant. This layer makes it durable.
 *
 * Writes are fire-and-forget from the caller's perspective. On failure the
 * server remains the source of truth: React Query refetches and the local
 * value is corrected, and the user is told rather than left believing the
 * change was saved.
 */

/**
 * Server-backed items carry a distinct library id and media id. Locally
 * created ones (added while offline, or before the catalog knew the title)
 * share a single id and have nothing to sync to yet.
 */
export function resolveServerLibraryId(localId: string): string | null {
  const item = snapshotAllItems().find((m) => m.id === localId);
  if (!item) return null;
  const mediaId = (item as { mediaId?: string }).mediaId;
  if (!mediaId || mediaId === item.id) return null;
  return item.id;
}

export function useLibrarySync() {
  const updateItem = useUpdateLibraryItem();

  /**
   * Push a patch for a library item. Resolves to true when it reached the
   * server, false when the item is local-only or the request failed.
   */
  const push = useCallback(
    async (localId: string, input: UpdateLibraryItemInput, label: string): Promise<boolean> => {
      const serverId = resolveServerLibraryId(localId);
      if (!serverId) {
        // Local-only item: nothing to sync. Not an error — the user may have
        // added it before it existed in the catalog.
        return false;
      }

      try {
        await updateItem.mutateAsync({ id: serverId, input });
        return true;
      } catch (error) {
        toast.error(`Couldn't save ${label}`, {
          description:
            error instanceof Error ? error.message : "Your change may not persist. Try again.",
        });
        return false;
      }
    },
    [updateItem],
  );

  const syncStatus = useCallback(
    (localId: string, status: MediaStatus) =>
      push(localId, { status: adaptStatusToBackend(status) }, "status"),
    [push],
  );

  const syncFavorite = useCallback(
    (localId: string, favorite: boolean) => push(localId, { favorite }, "favourite"),
    [push],
  );

  const syncProgress = useCallback(
    (localId: string, percentage: number) => {
      const input: UpdateLibraryItemInput = { progress: percentage };
      // Reaching 100% is a completion, not just a progress update.
      if (percentage >= 100) {
        input.status = adaptStatusToBackend("completed");
        input.finishedAt = new Date().toISOString();
      }
      return push(localId, input, "progress");
    },
    [push],
  );

  const syncReflection = useCallback(
    (localId: string, rating?: number, notes?: string, favorite?: boolean) => {
      const input: UpdateLibraryItemInput = {};
      if (rating !== undefined) input.rating = rating;
      if (notes !== undefined) input.notes = notes;
      if (favorite !== undefined) input.favorite = favorite;
      if (Object.keys(input).length === 0) return Promise.resolve(false);
      return push(localId, input, "reflection");
    },
    [push],
  );

  const syncRewatch = useCallback(
    (localId: string) => {
      const meta = useLibraryStore.getState().meta[localId];
      const count = meta?.timesWatched ?? 0;
      return push(localId, { rewatchCount: count }, "rewatch count");
    },
    [push],
  );

  return {
    syncStatus,
    syncFavorite,
    syncProgress,
    syncReflection,
    syncRewatch,
    isSyncing: updateItem.isPending,
  };
}
