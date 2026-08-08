/**
 * Adapter layer: API responses → Canonical UI types
 *
 * Every component should import UI types from ./types
 * and use adapter functions to transform API responses.
 *
 * NEVER import backend DTOs directly into components.
 */

// Canonical UI types
export type {
  UIMediaKind,
  UIMediaStatus,
  UIMediaItem,
  UICollection,
  UICollectionItem,
  UIProfile,
  UIJournalEntry,
  UIMemory,
  UITimelineEvent,
  UIDashboard,
  UIContinueItem,
  UIRecentActivity,
  UIPinnedCollection,
  UISearchResult,
  UIOverview,
  UIStreak,
  UINotification,
  UIWrappedSlide,
} from "./types";

export { UI_MEDIA_KIND_LABEL, UI_STATUS_LABEL } from "./types";

// Adapters
export { adaptStatus, adaptStatusToBackend } from "./status";
export { adaptMediaType, adaptMediaTypeToBackend } from "./mediatype";
export {
  adaptMediaResponse,
  adaptLibraryItem,
  adaptContinueItem,
  getLibraryId,
  getMediaId,
} from "./media";
export { adaptCollectionResponse } from "./collection";
export { adaptDashboardResponse } from "./dashboard";
export { adaptJournalEntry, adaptMemory, adaptTimelineEvent } from "./journal";
export { adaptSearchResult } from "./search";
export { adaptNotification } from "./notifications";
export { adaptOverview, adaptStreaks } from "./analytics";
export { adaptProfile } from "./users";
export { adaptWrappedResponse } from "./wrapped";
