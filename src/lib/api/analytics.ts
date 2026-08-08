import { apiGet } from "./fetch";

export interface ContinueItem {
  libraryId: string;
  mediaId: string;
  title: string;
  slug: string;
  posterUrl: string | null;
  mediaType: string;
  progress: number;
  progressPercentage: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface PinnedCollection {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
}

export interface DashboardResponse {
  continueWatching: ContinueItem[];
  continueReading: ContinueItem[];
  continuePlaying: ContinueItem[];
  continueListening: ContinueItem[];
  continueLearning: ContinueItem[];
  recentlyAdded: RecentActivityItem[];
  recentlyCompleted: RecentActivityItem[];
  recentMemories: RecentActivityItem[];
  recentJournalEntries: RecentActivityItem[];
  pinnedCollections: PinnedCollection[];
}

export interface OverviewResponse {
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
  averageRating: number | null;
  favoriteGenre: string | null;
  favoriteMediaType: string | null;
  totalLibraryItems: number;
  totalJournalEntries: number;
  totalMemories: number;
  totalReviews: number;
}

export interface StreaksResponse {
  currentStreak: number;
  longestStreak: number;
  weeklyActivity: { period: string; count: number }[];
  monthlyActivity: { period: string; count: number }[];
  yearlyActivity: { period: string; count: number }[];
  completionStreak: number;
  journalStreak: number;
}

export interface MediaAnalyticsResponse {
  completionByType: Record<string, number>;
  progressDistribution: Record<string, number>;
  ratingsDistribution: Record<string, number>;
  reviewCount: number;
  favoriteCount: number;
  bookmarkCount: number;
  totalByType: Record<string, number>;
}

export interface GenreAnalyticsResponse {
  topGenres: { genre: string; count: number; percentage: number }[];
  genreCompletion: Record<string, number>;
  genreRatings: Record<string, number>;
  genreTimeSpent: Record<string, number>;
}

export interface ActivityResponse {
  heatmap: { date: string; count: number }[];
  byWeekday: Record<string, number>;
  byHour: Record<string, number>;
  timeline: RecentActivityItem[];
}

export interface CalendarEntry {
  date: string;
  journalCount: number;
  memoryCount: number;
  completedCount: number;
  hoursTracked: number;
}

export interface CalendarResponse {
  entries: CalendarEntry[];
}

export interface InsightsResponse {
  mostActiveWeekday: string;
  favoriteGenre: string | null;
  mostProductiveMonth: string | null;
  totalUniqueMedia: number;
  totalHoursSpent: number;
  longestBinge?: string;
  averageCompletionTime?: string;
}

export async function getDashboard(): Promise<DashboardResponse> {
  return apiGet<DashboardResponse>("/analytics/dashboard");
}

export async function getOverview(): Promise<OverviewResponse> {
  return apiGet<OverviewResponse>("/analytics/overview");
}

export async function getStreaks(): Promise<StreaksResponse> {
  return apiGet<StreaksResponse>("/analytics/streaks");
}

export async function getMediaAnalytics(): Promise<MediaAnalyticsResponse> {
  return apiGet<MediaAnalyticsResponse>("/analytics/media");
}

export async function getGenreAnalytics(): Promise<GenreAnalyticsResponse> {
  return apiGet<GenreAnalyticsResponse>("/analytics/genres");
}

export async function getActivity(): Promise<ActivityResponse> {
  return apiGet<ActivityResponse>("/analytics/activity");
}

export async function getCalendar(year?: number, month?: number): Promise<CalendarResponse> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  const qs = params.toString();
  return apiGet<CalendarResponse>(`/analytics/calendar${qs ? `?${qs}` : ""}`);
}

export async function getInsights(): Promise<InsightsResponse> {
  return apiGet<InsightsResponse>("/analytics/insights");
}

export interface ConstellationEntry {
  label: string;
  count: number;
  value: number;
  color: string;
}

export interface CalendarYearResponse {
  year: number;
  stats: CalendarYearStatsResponse;
  months: CalendarMonthResponse[];
  heatmap: CalendarHeatmapCellResponse[];
  highlights: CalendarHighlightResponse[];
  streaks: CalendarYearStreakResponse[];
  upcoming: CalendarYearUpcomingResponse[];
  insights: string[];
}

export interface CalendarYearStatsResponse {
  totalStories: number;
  totalJournals: number;
  longestStreak: number;
  totalHours: number;
}

export interface CalendarMonthResponse {
  month: number;
  name: string;
  journalCount: number;
  storyCount: number;
  hoursTracked: number;
  topMedia: { id: string; title: string; posterUrl: string | null; mediaType: string }[];
  dayHits: number;
}

export interface CalendarHeatmapCellResponse {
  week: number;
  day: number;
  value: number;
}

export interface CalendarHighlightResponse {
  label: string;
  value: string;
  note: string;
  mediaId: string;
  posterUrl: string | null;
  accent: string;
}

export interface CalendarYearStreakResponse {
  label: string;
  value: number;
  total: number;
  accent: string;
}

export interface CalendarYearUpcomingResponse {
  title: string;
  posterUrl: string | null;
  when: string;
  countdown: string;
  accent: string;
}

export interface CalendarDayResponse {
  date: string;
  mediaItems: {
    id: string;
    title: string;
    posterUrl: string | null;
    mediaType: string;
    note: string;
  }[];
  journalEntry: { id: string; content: string; mood: string | null } | null;
}

export async function getCalendarDay(date: string): Promise<CalendarDayResponse> {
  return apiGet<CalendarDayResponse>(`/analytics/calendar/day?date=${date}`);
}

export async function getCalendarYear(year: number): Promise<CalendarYearResponse> {
  return apiGet<CalendarYearResponse>(`/analytics/calendar/year?year=${year}`);
}

// ─── Discovery ────────────────────────────────

export interface DiscoveryResponse {
  recommendedToday: RecommendationItem | null;
  continueMood: RecommendationItem[];
  hiddenGems: RecommendationItem[];
  continueFranchises: FranchiseItem[];
  comfortStories: RecommendationItem[];
  seasonalStories: RecommendationItem[];
  genreExpansion: {
    genre: string;
    recommendation: RecommendationItem | null;
    yourTopMedia: { id: string; title: string; posterUrl: string | null }[];
  }[];
  creatorRecommendations: {
    creator: string;
    accent: string;
    completedCount: number;
    totalWorks: number;
    topPick: { id: string; title: string; posterUrl: string | null } | null;
  }[];
  trendingInLibrary: RecommendationItem[];
  undiscoveredFavorites: RecommendationItem[];
  shortWeekendStories: RecommendationItem[];
  longJourneyStories: RecommendationItem[];
  rewatchSuggestions: RecommendationItem[];
  almostFinished: RecommendationItem[];
}

export interface RecommendationItem {
  mediaId: string;
  mediaTitle: string;
  mediaSlug: string;
  mediaType: string;
  posterUrl: string | null;
  accent: string | null;
  reason: string;
  source: string;
  confidence: number;
  compatibility: number;
  discoveryTags: string[];
  year: number;
  rating: number | null;
  genres: string[];
}

export interface FranchiseItem {
  creator: string;
  accent: string;
  current: { id: string; title: string; posterUrl: string | null; progress: number } | null;
  next: { id: string; title: string; posterUrl: string | null } | null;
  totalWorks: number;
  completedWorks: number;
}

export async function getDiscovery(): Promise<DiscoveryResponse> {
  return apiGet<DiscoveryResponse>("/analytics/discovery");
}

// ─── Intelligence ─────────────────────────────

export interface IntelligenceResponse {
  tasteProfile: {
    favoriteGenres: { name: string; count: number }[];
    favoriteCreators: { name: string; count: number }[];
    favoriteEras: { name: string; count: number }[];
    favoriteLanguages: string[];
    favoriteRuntime: string;
    favoritePlatforms: string[];
    favoriteSeasons: string[];
    favoriteTimeOfDay: string;
    favoriteMood: string;
    favoriteCompanion: string;
    favoriteCompletionPattern: string;
  };
  personalStatements: { statement: string; confidence: number; evidence: string }[];
  mediaEvolution: {
    year: string;
    focus: string;
    mediaCount: number;
    hoursSpent: number;
    topGenre: string;
    journalCount: number;
  }[];
  editorialInsight: string;
  impactSummary: { label: string; value: number; evidence?: string }[];
}

export async function getIntelligence(): Promise<IntelligenceResponse> {
  return apiGet<IntelligenceResponse>("/analytics/intelligence");
}

// ─── Challenges ───────────────────────────────

export interface ChallengesResponse {
  challenges: {
    id: string;
    kind: string;
    title: string;
    description: string;
    target: number;
    current: number;
    reward: string;
    expiresIn?: string;
    suggestions: { id: string; title: string; posterUrl: string | null; mediaType: string }[];
    accent: string;
  }[];
  goals: {
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    deadline?: string;
    priority: string;
    reward: string;
    reason: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    accent: string;
    coverIds: string[];
    milestones: { label: string; reached: boolean; when?: string }[];
    kind: string;
  }[];
}

export async function getChallenges(): Promise<ChallengesResponse> {
  return apiGet<ChallengesResponse>("/analytics/challenges");
}

export interface ConstellationEntry {
  label: string;
  count: number;
  value: number;
  color: string;
}

export async function getConstellation(categories?: string[]): Promise<ConstellationEntry[]> {
  const params = new URLSearchParams();
  if (categories && categories.length > 0) {
    params.set("categories", categories.join(","));
  }
  const qs = params.toString();
  return apiGet<ConstellationEntry[]>(`/analytics/constellation${qs ? `?${qs}` : ""}`);
}
