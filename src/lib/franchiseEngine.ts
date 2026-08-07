// Franchise engine — manual seed grouping of media into franchises.
// Covers resolve from live library data passed by consuming components.
import type { MediaItem, Collection } from "@/lib/types";

export interface Franchise {
  id: string;
  name: string;
  description: string;
  cover: string;
  accent?: string;
  mediaIds: string[];
}

export const FRANCHISES: Franchise[] = [];

export function getFranchiseCovers(_items: MediaItem[]): Record<string, string> {
  return {};
}

export function getFranchiseMedia(franchise: Franchise, _items: MediaItem[]): MediaItem[] {
  return [];
}

export function getAllFranchises(_items?: MediaItem[]): Franchise[] {
  return FRANCHISES;
}

export interface FranchiseProfile {
  franchise: Franchise;
  media: MediaItem[];
  collections: Collection[];
  relatedFranchises: Franchise[];
  completion: number;
  entries: MediaItem[];
  timeline: { id: string; label: string; when: string }[];
}

export function buildFranchiseProfile(_id: string): FranchiseProfile | undefined {
  return undefined;
}
