/**
 * Dashboard adapter: API response → UIDashboard
 */

import type { UIDashboard, UIContinueItem, UIRecentActivity, UIPinnedCollection } from "./types";
import type {
  DashboardResponse,
  ContinueItem,
  RecentActivityItem,
  PinnedCollection,
} from "@/lib/api/analytics";

function adaptContinueItem(item: ContinueItem): UIContinueItem {
  return {
    libraryId: item.libraryId,
    mediaId: item.mediaId,
    title: item.title,
    slug: item.slug,
    posterUrl: item.posterUrl,
    mediaType: item.mediaType,
    progress: item.progress,
    progressPercentage: item.progressPercentage,
  };
}

function adaptRecentActivity(item: RecentActivityItem): UIRecentActivity {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    date: item.date,
  };
}

function adaptPinnedCollection(item: PinnedCollection): UIPinnedCollection {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    itemCount: item.itemCount,
  };
}

export function adaptDashboardResponse(d: DashboardResponse): UIDashboard {
  return {
    continueWatching: (d.continueWatching ?? []).map(adaptContinueItem),
    continueReading: (d.continueReading ?? []).map(adaptContinueItem),
    continuePlaying: (d.continuePlaying ?? []).map(adaptContinueItem),
    continueListening: (d.continueListening ?? []).map(adaptContinueItem),
    continueLearning: (d.continueLearning ?? []).map(adaptContinueItem),
    recentlyAdded: (d.recentlyAdded ?? []).map(adaptRecentActivity),
    recentlyCompleted: (d.recentlyCompleted ?? []).map(adaptRecentActivity),
    recentMemories: (d.recentMemories ?? []).map(adaptRecentActivity),
    recentJournalEntries: (d.recentJournalEntries ?? []).map(adaptRecentActivity),
    pinnedCollections: (d.pinnedCollections ?? []).map(adaptPinnedCollection),
  };
}
