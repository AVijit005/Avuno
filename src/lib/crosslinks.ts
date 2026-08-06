// Crosslinks — surface peer entities for any media item.
import type { MediaItem } from "@/lib/types";
import type { Goal } from "@/lib/goals";

export interface Crosslinks {
  collections: any[];
  journal: any[];
  goals: Goal[];
  related: MediaItem[];
}

export function getCrosslinks(_item: MediaItem): Crosslinks {
  return {
    collections: [],
    journal: [],
    goals: [],
    related: [],
  };
}
