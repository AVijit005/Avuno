// Crosslinks — surface peer entities for any media item.
import type { MediaItem } from "@/lib/types";
import type { Goal } from "@/lib/goals";
import type { UICollection } from "@/lib/adapters/types";
import type { UIJournalEntry } from "@/lib/adapters/types";

export interface Crosslinks {
  collections: UICollection[];
  journal: UIJournalEntry[];
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
