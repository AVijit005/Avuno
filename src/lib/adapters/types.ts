/**
 * Canonical UI types for Chronicle frontend.
 *
 * These types are the ONLY types that components should consume.
 * They are created by adapter functions that transform API responses.
 *
 * NEVER import backend DTOs directly into components.
 * NEVER import mock types into components.
 */

// ─── Media ─────────────────────────────────────────────────

export type UIMediaKind =
  | "movie"
  | "series"
  | "anime"
  | "book"
  | "manga"
  | "game"
  | "music"
  | "podcast"
  | "course"
  | "youtube";

export type UIMediaStatus =
  | "in_progress"
  | "completed"
  | "planning"
  | "paused"
  | "dropped"
  | "rewatching"
  | "archived"
  | "on_hold";

export interface UIMediaItem {
  id: string;
  mediaId: string;
  title: string;
  kind: UIMediaKind;
  year: number;
  poster: string;
  backdrop: string | null;
  rating: number | null;
  progress: number | null;
  progressLabel: string | null;
  status: UIMediaStatus;
  genres: string[];
  runtime: string | null;
  creator: string | null;
  synopsis: string;
  accent: string | null;
  favorite: boolean;
  slug: string;
  mediaType: string;
  lastInteractionAt: string | null;
  rewatchCount: number | null;
}

// ─── Collection ────────────────────────────────────────────

export interface UICollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  itemCount: number;
  color: string | null;
  isPinned: boolean;
  visibility: "private" | "public" | "unlisted" | "followers";
  cover: string | null;
  items: UICollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UICollectionItem {
  id: string;
  position: number;
  note: string | null;
  mediaId: string;
  mediaType: string;
  title: string;
  slug: string;
  posterUrl: string | null;
}

// ─── Profile ───────────────────────────────────────────────

export interface UIProfile {
  id: string;
  email: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  timezone: string | null;
  themePreference: string | null;
  createdAt: string;
}

// ─── Journal ───────────────────────────────────────────────

export interface UIJournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  weather: string | null;
  location: string | null;
  isPrivate: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UIMemory {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  emotion: string | null;
  isPinned: boolean;
  coverImage: string | null;
  mediaCount: number;
  createdAt: string;
}

// ─── Timeline ──────────────────────────────────────────────

export interface UITimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  eventDate: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
}

// ─── Dashboard ─────────────────────────────────────────────

export interface UIDashboard {
  continueWatching: UIContinueItem[];
  continueReading: UIContinueItem[];
  continuePlaying: UIContinueItem[];
  continueListening: UIContinueItem[];
  continueLearning: UIContinueItem[];
  recentlyAdded: UIRecentActivity[];
  recentlyCompleted: UIRecentActivity[];
  recentMemories: UIRecentActivity[];
  recentJournalEntries: UIRecentActivity[];
  pinnedCollections: UIPinnedCollection[];
}

export interface UIContinueItem {
  libraryId: string;
  mediaId: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  mediaType: string;
  progress: number;
  progressPercentage: number;
}

export interface UIRecentActivity {
  id: string;
  title: string;
  type: string;
  date: string;
}

export interface UIPinnedCollection {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
}

// ─── Search ────────────────────────────────────────────────

export interface UISearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  matchedField: string | null;
  score: number;
}

// ─── Analytics ─────────────────────────────────────────────

export interface UIOverview {
  totalItems: number;
  completedItems: number;
  hoursSpent: number;
  averageRating: number | null;
  favoriteGenre: string | null;
  favoriteMediaType: string | null;
  journalEntries: number;
  memories: number;
  moviesCompleted: number;
  showsFinished: number;
  episodesWatched: number;
  booksRead: number;
  gamesFinished: number;
  coursesCompleted: number;
  hoursWatched: number;
  hoursRead: number;
  hoursPlayed: number;
  hoursLearned: number;
  totalReviews: number;
}

export interface UIStreak {
  current: number;
  longest: number;
  weeklyActivity: { period: string; count: number }[];
  monthlyActivity: { period: string; count: number }[];
  yearlyActivity: { period: string; count: number }[];
  completionStreak: number;
  journalStreak: number;
}

export interface UIMediaAnalytics {
  completionByType: Record<string, number>;
  progressDistribution: Record<string, number>;
  ratingsDistribution: Record<string, number>;
  reviewCount: number;
  favoriteCount: number;
  bookmarkCount: number;
  totalByType: Record<string, number>;
}

export interface UIGenreAnalytics {
  topGenres: { genre: string; count: number; percentage: number }[];
  genreCompletion: Record<string, number>;
  genreRatings: Record<string, number>;
  genreTimeSpent: Record<string, number>;
}

export interface UIActivity {
  heatmap: { date: string; count: number }[];
  byWeekday: Record<string, number>;
  byHour: Record<string, number>;
  timeline: UIRecentActivity[];
}

export interface UICalendarEntry {
  date: string;
  journalCount: number;
  memoryCount: number;
  completedCount: number;
  hoursTracked: number;
}

export interface UICalendar {
  entries: UICalendarEntry[];
}

export interface UICalendarYear {
  year: number;
  stats: { stories: number; journals: number; longestStreak: number; favoriteMonth: string };
  months: UICalendarMonth[];
  heatmap: { w: number; d: number; v: number }[];
  highlights: { label: string; value: string; note: string; media: { poster: string | null } }[];
  streaks: { label: string; value: number; total: number; accent: string }[];
  releases: { title: string; poster: string; when: string; countdown: string; accent: string }[];
  insights: string[];
}

export interface UICalendarMonth {
  index: number;
  name: string;
  short: string;
  daysInMonth: number;
  startDay: number;
  cells: { day: number; hasMedia: boolean; hasJournal: boolean; hasAchievement: boolean; intensity: number; mediaCount: number; poster: string }[];
  accent: string;
  favorite: string;
  genre: string;
  mediaCount: number;
  journalCount: number;
  hours: number;
  collage: string[];
}

export interface UIInsights {
  mostActiveWeekday: string;
  favoriteGenre: string | null;
  favoriteDecade: string | null;
  longestBinge: string | null;
  mostRewatchedMedia: string | null;
  mostRereadBook: string | null;
  mostReplayedGame: string | null;
  averageCompletionTime: number | null;
  mostProductiveMonth: string | null;
  totalUniqueMedia: number;
  totalHoursSpent: number;
}

// ─── Notifications ─────────────────────────────────────────

export interface UINotification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

// ─── Wrapped ───────────────────────────────────────────────

export interface UIWrappedSlide {
  key: string;
  eyebrow: string;
  title?: string;
  subtitle?: string;
  value?: string | number;
  unit?: string;
  caption?: string;
  accent?: string;
  poster?: string;
}

// ─── Constants ─────────────────────────────────────────────

export const UI_MEDIA_KIND_LABEL: Record<UIMediaKind, string> = {
  movie: "Movies",
  series: "Series",
  anime: "Anime",
  book: "Books",
  manga: "Manga",
  game: "Games",
  music: "Music",
  podcast: "Podcasts",
  course: "Courses",
  youtube: "YouTube",
};

export const UI_STATUS_LABEL: Record<UIMediaStatus, string> = {
  in_progress: "In the middle",
  completed: "Stayed with you",
  planning: "Future adventure",
  paused: "Waiting for the right time",
  dropped: "Left behind",
  rewatching: "Returning to",
  archived: "Archived",
  on_hold: "On hold",
};
