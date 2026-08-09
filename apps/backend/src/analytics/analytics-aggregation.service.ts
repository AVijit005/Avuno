/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import type {
  OverviewDto,
  MediaAnalyticsDto,
  GenreAnalyticsDto,
  ActivityDto,
  CalendarDto,
  CalendarEntryDto,
  GenreStatDto,
} from './dto';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

@Injectable()
export class AnalyticsAggregationService {
  private convertInternalRatingToApiScale(total: number, count: number): number {
    return Math.round((total / count / 2) * 10) / 10;
  }
  constructor(private readonly repository: AnalyticsRepository) {}

  async getOverview(userId: string): Promise<OverviewDto> {
    const [
      completedByType,
      totalsByType,
      totalItems,
      avgRating,
      journalCount,
      memoryCount,
      reviewCount,
      _favoriteCount,
      hoursData,
      genreData,
    ] = await Promise.all([
      this.repository.countCompletedByType(userId),
      this.repository.countTotalByType(userId),
      this.repository.getTotalLibraryItems(userId),
      this.repository.getAverageRating(userId),
      this.repository.getJournalEntryDates(userId, 10000),
      this.repository.getRecentMemories(userId, 10000),
      this.repository.getReviewCount(userId),
      this.repository.getFavoriteCount(userId),
      this.repository.getHoursAndEpisodesByType(userId),
      this.repository.getGenreData(userId),
    ]);

    return {
      moviesCompleted: completedByType['movie'] ?? 0,
      showsFinished: (completedByType['tvShow'] ?? 0) + (completedByType['anime'] ?? 0),
      episodesWatched: hoursData.episodes,
      booksRead: completedByType['book'] ?? 0,
      gamesFinished: completedByType['game'] ?? 0,
      coursesCompleted: completedByType['course'] ?? 0,
      hoursWatched:
        (hoursData.hours['movie'] ?? 0) + (hoursData.hours['tvShow'] ?? 0) + (hoursData.hours['anime'] ?? 0),
      hoursRead: hoursData.hours['book'] ?? 0,
      hoursPlayed: hoursData.hours['game'] ?? 0,
      hoursLearned: hoursData.hours['course'] ?? 0,
      averageRating: avgRating,
      favoriteGenre:
        Object.keys(genreData.genreCounts).length > 0
          ? (Object.entries(genreData.genreCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null)
          : null,
      favoriteMediaType: this.getFavoriteType(totalsByType),
      totalLibraryItems: totalItems,
      totalJournalEntries: journalCount.length,
      totalMemories: memoryCount.length,
      totalReviews: reviewCount,
    };
  }

  async getMediaAnalytics(userId: string): Promise<MediaAnalyticsDto> {
    const [completedByType, totalsByType, progressDist, ratingsDist, reviewCount, favCount, bookmarkCount] =
      await Promise.all([
        this.repository.countCompletedByType(userId),
        this.repository.countTotalByType(userId),
        this.repository.getProgressDistribution(userId),
        this.repository.getRatingsDistribution(userId),
        this.repository.getReviewCount(userId),
        this.repository.getFavoriteCount(userId),
        this.repository.getBookmarkCount(userId),
      ]);

    return {
      completionByType: completedByType,
      progressDistribution: progressDist,
      ratingsDistribution: ratingsDist,
      reviewCount,
      favoriteCount: favCount,
      bookmarkCount,
      totalByType: totalsByType,
    };
  }

  async getGenreAnalytics(userId: string): Promise<GenreAnalyticsDto> {
    const raw = await this.repository.getGenreData(userId);
    const total = Object.values(raw.genreCounts).reduce((a, b) => a + b, 0) || 1;

    const topGenres: GenreStatDto[] = Object.entries(raw.genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count, percentage: Math.round((count / total) * 100) }));

    const genreCompletion: Record<string, number> = {};
    for (const [genre, count] of Object.entries(raw.genreCompleted)) {
      const totalForGenre = raw.genreCounts[genre] ?? 1;
      genreCompletion[genre] = Math.round((count / totalForGenre) * 100);
    }

    const genreRatings: Record<string, number> = {};
    for (const [genre, data] of Object.entries(raw.genreRatings)) {
      genreRatings[genre] = this.convertInternalRatingToApiScale(data.total, data.count);
    }

    return {
      topGenres,
      genreCompletion,
      genreRatings,
      genreTimeSpent: Object.fromEntries(
        Object.entries(raw.genreTime)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
      ),
    };
  }

  async getActivity(userId: string): Promise<ActivityDto> {
    const [activityData, timeline] = await Promise.all([
      this.repository.getActivityData(userId, 365),
      this.repository.getRecentTimelineEvents(userId, 20),
    ]);

    const heatmap = Object.entries(activityData).map(([date, count]) => ({ date, count }));
    const byWeekday: Record<string, number> = {};
    const byHour: Record<string, number> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const [date, count] of Object.entries(activityData)) {
      const day = dayNames[new Date(date).getDay()];
      byWeekday[day] = (byWeekday[day] ?? 0) + count;
      // Simplified hour distribution
      const hour = new Date(date).getHours();
      const hourKey = `${hour}:00`;
      byHour[hourKey] = (byHour[hourKey] ?? 0) + count;
    }

    return {
      heatmap,
      byWeekday,
      byHour,
      timeline: timeline.map((t: any) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        date: t.eventDate?.toISOString() ?? t.createdAt?.toISOString() ?? '',
      })),
    };
  }

  async getCalendarYear(userId: string, year: number): Promise<any> {
    const raw = await this.repository.getCalendarData(userId, year);

    let totalStories = 0;
    let totalJournals = 0;
    let totalHours = 0;

    for (const key of Object.keys(raw.completedCounts)) totalStories += raw.completedCounts[key];
    for (const key of Object.keys(raw.journalCounts)) totalJournals += raw.journalCounts[key];
    for (const key of Object.keys(raw.hoursTracked)) totalHours += raw.hoursTracked[key];

    const months = Array.from({ length: 12 }, (_, month) => {
      let journalCount = 0;
      let storyCount = 0;
      let hoursTracked = 0;
      let dayHits = 0;

      for (let day = 1; day <= 31; day++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (raw.journalCounts[key]) {
          journalCount += raw.journalCounts[key];
          dayHits++;
        }
        if (raw.completedCounts[key]) {
          storyCount += raw.completedCounts[key];
          dayHits++;
        }
        if (raw.hoursTracked[key]) {
          hoursTracked += raw.hoursTracked[key];
        }
      }
      return {
        month,
        name: MONTH_NAMES[month],
        journalCount,
        storyCount,
        hoursTracked: Math.round(hoursTracked * 10) / 10,
        topMedia: [],
        dayHits,
      };
    });

    const activeDates = months.flatMap((m) => {
      const dates: string[] = [];
      for (let day = 1; day <= 31; day++) {
        const key = `${year}-${String(m.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (raw.journalCounts[key] || raw.completedCounts[key]) dates.push(key);
      }
      return dates;
    });
    const longestStreak = this.calculateLongestStreak(activeDates);

    const heatmap = Array.from({ length: 52 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => {
        const d = new Date(year, 0, 1 + week * 7 + day);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const val = (raw.completedCounts[key] ?? 0) + (raw.journalCounts[key] ?? 0);
        return { week, day, value: val };
      }),
    ).flat();

    const highlights: any[] = [];

    // Streak values are real counts. 'Journaling Consistency' previously
    // reported a hardcoded 5 whenever any journal existed, and 'Reading
    // Streak' a hardcoded 4 unconditionally — neither was computed from
    // anything, and both were shown to every user.
    const journalingDays = Object.values(raw.journalCounts).filter((n) => n > 0).length;
    const streaks = [
      {
        label: 'Daily Media Streak',
        value: totalStories > 0 ? longestStreak : 0,
        total: 30,
        accent: 'var(--primary)',
      },
      {
        label: 'Days Journalled',
        value: journalingDays,
        total: 30,
        accent: 'oklch(0.72 0.16 160)',
      },
    ];

    const upcoming: any[] = [];

    // Only state what the data supports. The peak month is computed rather
    // than hardcoded to July, and the "Sci-Fi was your most revisited genre"
    // line is gone: this aggregation has no genre data, so it was pure
    // invention sent identically to every user.
    const insights: string[] = [
      `You recorded ${totalStories} stories and ${totalJournals} journal reflections in ${year}.`,
    ];

    const peak = months.reduce<{ name: string; count: number } | null>((best, m) => {
      const count = m.storyCount + m.journalCount;
      if (count === 0) return best;
      return !best || count > best.count ? { name: MONTH_NAMES[m.month], count } : best;
    }, null);

    if (peak) {
      insights.push(
        `${peak.name} was your most active month, with ${peak.count} ${peak.count === 1 ? 'entry' : 'entries'}.`,
      );
    }

    return {
      year,
      stats: { totalStories, totalJournals, longestStreak, totalHours: Math.round(totalHours * 10) / 10 },
      months,
      heatmap,
      highlights,
      streaks,
      upcoming,
      insights,
    };
  }

  private calculateLongestStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    const sorted = [...new Set(dates)].sort();
    let max = 1;
    let curr = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]).getTime();
      const next = new Date(sorted[i]).getTime();
      const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        curr++;
        if (curr > max) max = curr;
      } else if (diffDays > 1) {
        curr = 1;
      }
    }
    return max;
  }

  async getCalendarDay(userId: string, date: string): Promise<any> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [journalEntries, memories, libraryItems] = await Promise.all([
      this.repository.getRecentJournalEntries(userId, 100),
      this.repository.getRecentMemories(userId, 100),
      this.repository.getRecentlyAdded(userId, 100),
    ]);

    const dayJournal = journalEntries.filter((e: any) => {
      const d = new Date(e.createdAt);
      return d >= dayStart && d <= dayEnd;
    });

    const dayMemories = memories.filter((m: any) => {
      const d = new Date(m.createdAt);
      return d >= dayStart && d <= dayEnd;
    });

    const dayLibrary = libraryItems.filter((item: any) => {
      const d = new Date(item.createdAt);
      return d >= dayStart && d <= dayEnd;
    });

    const mediaItems = dayLibrary.map((item: any) => ({
      mediaType: item._mediaType ?? 'movie',
      title: item.title ?? 'Untitled',
      note: item.notes ?? null,
    }));

    return {
      date,
      mediaItems,
      journalEntry: dayJournal[0] ?? null,
      memories: dayMemories,
    };
  }

  async getCalendar(userId: string, year: number, month: number): Promise<CalendarDto> {
    const raw = await this.repository.getCalendarData(userId, year, month);
    const allDates = new Set([
      ...Object.keys(raw.journalCounts),
      ...Object.keys(raw.memoryCounts),
      ...Object.keys(raw.completedCounts),
      ...Object.keys(raw.hoursTracked),
    ]);

    const entries: CalendarEntryDto[] = [...allDates].sort().map((date) => ({
      date,
      journalCount: raw.journalCounts[date] ?? 0,
      memoryCount: raw.memoryCounts[date] ?? 0,
      completedCount: raw.completedCounts[date] ?? 0,
      hoursTracked: Math.round((raw.hoursTracked[date] ?? 0) * 10) / 10,
    }));

    return { entries };
  }

  private getFavoriteType(totals: Record<string, number>): string | null {
    return Object.entries(totals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }
}
