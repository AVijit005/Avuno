// Franchise engine — manual seed grouping of media into franchises.
// Covers resolve from live library data passed by consuming components.
import type { MediaItem, Collection } from "@/lib/types";

export interface Franchise {
  id: string;
  name: string;
  description: string;
  cover: string;
  mediaIds: string[];
}

export const FRANCHISES: Franchise[] = [];

export function getFranchiseCovers(_items: MediaItem[]): Record<string, string> {
  return {};
}

export function getFranchiseMedia(franchise: Franchise, _items: MediaItem[]): MediaItem[] {
  return [];
}

export function getAllFranchises(_items: MediaItem[]): Franchise[] {
  return FRANCHISES;
}

export function buildFranchiseProfile(id: string): Franchise | undefined {
  return FRANCHISES.find((f) => f.id === id);
}
