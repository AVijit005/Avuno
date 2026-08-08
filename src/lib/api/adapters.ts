import type { MediaItem, MediaKind, Collection } from "@/lib/types";
import type { LibraryItemResponse } from "@/lib/api/library";
import type { MediaResponse } from "@/lib/api/media";
import type { ContinueItem } from "@/lib/api/analytics";
import type { CollectionResponse } from "@/lib/api/collections";

const MEDIA_TYPE_TO_KIND: Record<string, MediaKind> = {
  movie: "movie",
  tvShow: "series",
  anime: "anime",
  book: "book",
  manga: "manga",
  game: "game",
  musicAlbum: "music",
  podcast: "podcast",
  course: "course",
};

const STATUS_MAP: Record<string, MediaItem["status"]> = {
  PLANNING: "planned",
  WATCHING: "watching",
  READING: "reading",
  PLAYING: "playing",
  LISTENING: "listening",
  LEARNING: "learning",
  PAUSED: "paused",
  COMPLETED: "completed",
  DROPPED: "dropped",
  ARCHIVED: "archived",
};

export function mediaResponseToMediaItem(m: MediaResponse): MediaItem {
  return {
    id: m.id,
    title: m.title,
    kind: MEDIA_TYPE_TO_KIND[m.mediaType] ?? "movie",
    year:
      m.releaseYear ??
      (m.releaseDate ? new Date(m.releaseDate).getFullYear() : new Date().getFullYear()),
    poster: m.posterUrl ?? m.coverImage ?? m.thumbnail ?? "",
    backdrop: m.backdropUrl ?? m.bannerUrl ?? undefined,
    rating: 0,
    progress: 0,
    status: "planned",
    genres: m.genres ?? [],
    runtime: m.runtime ? `${m.runtime}m` : undefined,
    creator: undefined,
    accent: undefined,
    synopsis: m.description ?? m.overview ?? "",
  };
}

export function libraryItemToMediaItem(item: LibraryItemResponse): MediaItem {
  const media = item.media;
  return {
    id: item.id,
    title: media?.title ?? "Unknown",
    kind: MEDIA_TYPE_TO_KIND[item.mediaType] ?? "movie",
    year: media?.releaseYear ?? new Date().getFullYear(),
    poster: media?.posterUrl ?? "",
    backdrop: undefined,
    rating: item.rating ?? 0,
    progress: item.progressPercentage ?? item.progress ?? 0,
    status: STATUS_MAP[item.status] ?? "watching",
    genres: media?.genres ?? [],
    runtime: undefined,
    creator: undefined,
    accent: undefined,
    synopsis: "",
    _libraryId: item.id,
    _mediaId: media?.id,
  } as MediaItem & { _libraryId: string; _mediaId: string };
}

export function continueItemToMediaItem(item: ContinueItem): MediaItem {
  return {
    id: item.libraryId,
    title: item.title,
    kind: MEDIA_TYPE_TO_KIND[item.mediaType] ?? "movie",
    year: new Date().getFullYear(),
    poster: item.posterUrl ?? "",
    backdrop: undefined,
    rating: 0,
    progress: item.progressPercentage ?? item.progress ?? 0,
    status: "watching",
    genres: [],
    runtime: undefined,
    creator: undefined,
    accent: undefined,
    synopsis: "",
    _libraryId: item.libraryId,
    _mediaId: item.mediaId,
  } as MediaItem & { _libraryId: string; _mediaId: string };
}

export function collectionResponseToCollection(c: CollectionResponse): Collection {
  return {
    id: c.id,
    name: c.name,
    count: c.itemCount ?? 0,
    cover: c.items?.[0]?.posterUrl ?? "",
    accent: c.color ?? "oklch(0.72 0.18 255)",
    description: c.description ?? "",
    mediaIds: c.items?.map((i) => i.mediaId) ?? [],
    pinned: c.isPinned,
    category: undefined,
    completion: c.stats?.completionPercent,
    avgRating: undefined,
  };
}

export function getLibraryId(item: MediaItem): string | undefined {
  return (item as { _libraryId?: string })._libraryId;
}

export function getMediaId(item: MediaItem): string | undefined {
  return (item as { _mediaId?: string })._mediaId;
}
