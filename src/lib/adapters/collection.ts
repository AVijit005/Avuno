/**
 * Collection adapter: API responses → UICollection
 */

import type { UICollection, UICollectionItem } from "./types";
import type { CollectionResponse, CollectionItemResponse } from "@/lib/api/collections";

const PLACEHOLDER_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' fill='%231a1a2e'%3E%3Crect width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-family='system-ui' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function adaptCollectionItem(item: CollectionItemResponse): UICollectionItem {
  return {
    id: item.id,
    position: item.position,
    note: item.note,
    mediaId: item.mediaId,
    mediaType: item.mediaType,
    title: item.title,
    slug: item.slug,
    posterUrl: item.posterUrl ?? null,
  };
}

export function adaptCollectionResponse(c: CollectionResponse): UICollection {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    itemCount: c.itemCount,
    color: c.color,
    isPinned: c.isPinned,
    visibility: mapVisibility(c.visibility),
    cover: c.items?.[0]?.posterUrl ?? null,
    items: (c.items ?? []).map(adaptCollectionItem),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function mapVisibility(v: string): UICollection["visibility"] {
  const map: Record<string, UICollection["visibility"]> = {
    PRIVATE: "private",
    PUBLIC: "public",
    UNLISTED: "unlisted",
    FOLLOWERS_ONLY: "followers",
  };
  return map[v] ?? "private";
}
