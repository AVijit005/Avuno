import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repoMock: Record<string, ReturnType<typeof mock>>;
  let aggregationMock: Record<string, ReturnType<typeof mock>>;
  let dashboardMock: Record<string, ReturnType<typeof mock>>;
  let streakMock: Record<string, ReturnType<typeof mock>>;
  let insightsMock: Record<string, ReturnType<typeof mock>>;

  beforeEach(() => {
    repoMock = {};
    aggregationMock = {
      getOverview: mock(() =>
        Promise.resolve({
          moviesCompleted: 5,
          showsFinished: 3,
          episodesWatched: 0,
          booksRead: 2,
          gamesFinished: 1,
          coursesCompleted: 0,
          hoursWatched: 0,
          hoursRead: 0,
          hoursPlayed: 0,
          hoursLearned: 0,
          averageRating: null,
          favoriteGenre: null,
          favoriteMediaType: null,
          totalLibraryItems: 20,
          totalJournalEntries: 10,
          totalMemories: 5,
          totalReviews: 2,
        }),
      ),
      getMediaAnalytics: mock(() =>
        Promise.resolve({
          completionByType: {},
          progressDistribution: {},
          ratingsDistribution: {},
          reviewCount: 0,
          favoriteCount: 0,
          bookmarkCount: 0,
          totalByType: {},
        }),
      ),
      getGenreAnalytics: mock(() =>
        Promise.resolve({ topGenres: [], genreCompletion: {}, genreRatings: {}, genreTimeSpent: {} }),
      ),
      getActivity: mock(() => Promise.resolve({ heatmap: [], byWeekday: {}, byHour: {}, timeline: [] })),
      getCalendar: mock(() => Promise.resolve({ entries: [] })),
    };
    dashboardMock = {
      getDashboard: mock(() =>
        Promise.resolve({
          continueWatching: [],
          continueReading: [],
          continuePlaying: [],
          continueListening: [],
          continueLearning: [],
          recentlyAdded: [],
          recentlyCompleted: [],
          recentMemories: [],
          recentJournalEntries: [],
          pinnedCollections: [],
        }),
      ),
    };
    streakMock = {
      getStreaks: mock(() =>
        Promise.resolve({
          currentStreak: 0,
          longestStreak: 0,
          weeklyActivity: [],
          monthlyActivity: [],
          yearlyActivity: [],
          completionStreak: 0,
          journalStreak: 0,
        }),
      ),
    };
    insightsMock = {
      getInsights: mock(() =>
        Promise.resolve({
          mostActiveWeekday: 'Mon',
          favoriteGenre: null,
          favoriteDecade: null,
          longestBinge: null,
          mostRewatchedMedia: null,
          mostRereadBook: null,
          mostReplayedGame: null,
          averageCompletionTime: null,
          mostProductiveMonth: null,
          totalUniqueMedia: 0,
          totalHoursSpent: 0,
        }),
      ),
    };

    service = new AnalyticsService(
      repoMock as any,
      aggregationMock as any,
      dashboardMock as any,
      streakMock as any,
      insightsMock as any,
    );
  });

  it('returns dashboard', async () => {
    const result = await service.getDashboard('user-1');
    expect(result.continueWatching).toEqual([]);
  });

  it('returns overview', async () => {
    const result = await service.getOverview('user-1');
    expect(result.moviesCompleted).toBe(5);
  });

  it('returns streaks', async () => {
    const result = await service.getStreaks('user-1');
    expect(result.currentStreak).toBe(0);
  });

  it('returns media analytics', async () => {
    const result = await service.getMediaAnalytics('user-1');
    expect(result.reviewCount).toBe(0);
  });

  it('returns genre analytics', async () => {
    const result = await service.getGenreAnalytics('user-1');
    expect(result.topGenres).toEqual([]);
  });

  it('returns activity', async () => {
    const result = await service.getActivity('user-1');
    expect(result.heatmap).toEqual([]);
  });

  it('returns calendar', async () => {
    const result = await service.getCalendar('user-1', 2024, 1);
    expect(result.entries).toEqual([]);
  });

  it('returns insights', async () => {
    const result = await service.getInsights('user-1');
    expect(result.mostActiveWeekday).toBe('Mon');
  });
});
