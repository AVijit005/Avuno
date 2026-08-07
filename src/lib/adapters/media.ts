/**
 * Media adapter: API responses → UIMediaItem
 *
 * Transforms backend DTOs into the canonical UI type.
 * Handles null fields, enum mapping, and computed properties.
 */

import type { UIMediaItem } from "./types";
import { adaptMediaType } from "./mediatype";
import { adaptStatus } from "./status";
import type { MediaResponse } from "@/lib/api/media";
import type { LibraryItemResponse } from "@/lib/api/library";
import type { ContinueItem, RecentActivityItem } from "@/lib/api/analytics";

const PLACEHOLDER_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' fill='%231a1a2e'%3E%3Crect width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-family='system-ui' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Transform a media catalog response into a UI media item.
 * Used when displaying media that is NOT in the user's library.
 */
export function adaptMediaResponse(m: MediaResponse): UIMediaItem {
  return {
    id: m.id,
    mediaId: m.id,
    title: m.title,
    kind: adaptMediaType(m.mediaType),
    year: m.releaseYear ?? 0,
    poster: m.posterUrl ?? m.coverImage ?? m.thumbnail ?? PLACEHOLDER_POSTER,
    backdrop: m.backdropUrl ?? m.bannerUrl ?? null,
    rating: null,
    progress: null,
    progressLabel: null,
    status: "planning",
    genres: m.genres ?? [],
    runtime: formatRuntime(m.runtime),
    creator: null,
    synopsis: m.description ?? m.overview ?? "",
    accent: null,
    favorite: false,
    slug: m.slug,
    mediaType: m.mediaType,
    lastInteractionAt: null,
    rewatchCount: null,
  };
}

/**
 * Transform a library item response into a UI media item.
 * Used when displaying items from the user's library.
 */
export function adaptLibraryItem(item: LibraryItemResponse): UIMediaItem {
  const media = item.media;
  return {
    id: item.id,
    mediaId: media?.id ?? item.id,
    title: media?.title ?? "Unknown",
    kind: adaptMediaType(item.mediaType),
    year: media?.releaseYear ?? 0,
    poster: media?.posterUrl ?? PLACEHOLDER_POSTER,
    backdrop: media?.backdropUrl ?? null,
    rating: item.rating,
    progress: item.progressPercentage ?? item.progress ?? null,
    progressLabel: null,
    status: adaptStatus(item.status),
    genres: media?.genres ?? [],
    runtime: null,
    creator: null,
    synopsis: "",
    accent: null,
    favorite: item.favorite,
    slug: media?.slug ?? "",
    mediaType: item.mediaType,
    lastInteractionAt: item.lastInteractionAt,
    rewatchCount: item.rewatchCount,
  };
}

/**
 * Transform a continue item (from dashboard) into a UI media item.
 * Used for "Continue Watching" sections.
 */
export function adaptContinueItem(item: ContinueItem): UIMediaItem {
  return {
    id: item.libraryId,
    mediaId: item.mediaId,
    title: item.title,
    kind: adaptMediaType(item.mediaType),
    year: 0,
    poster: item.posterUrl ?? PLACEHOLDER_POSTER,
    backdrop: null,
    rating: null,
    progress: item.progressPercentage ?? item.progress ?? 0,
    progressLabel: null,
    status: "in_progress",
    genres: [],
    runtime: null,
    creator: null,
    synopsis: "",
    accent: null,
    favorite: false,
    slug: item.slug,
    mediaType: item.mediaType,
    lastInteractionAt: null,
    rewatchCount: null,
  };
}

/**
 * Transform a RecentActivityItem (from dashboard) into a ContinueItem shape for adaptContinueItem.
 */
export function activityToContinueItem(item: RecentActivityItem): ContinueItem {
  return {
    libraryId: item.id,
    mediaId: item.id,
    title: item.title,
    slug: item.id,
    posterUrl: null,
    mediaType: item.type ?? "movie",
    progress: 100,
    progressPercentage: 100,
  };
}

export function getLibraryId(item: UIMediaItem): string | null {
  // If the item's id differs from its mediaId, the id is the library ID
  return item.id !== item.mediaId ? item.id : null;
}

/**
 * Extract the media catalog ID from a UI media item.
 */
export function getMediaId(item: UIMediaItem): string {
  return item.mediaId;
}
