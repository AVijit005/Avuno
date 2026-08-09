import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import type { InsightsDto } from './dto';

@Injectable()
export class InsightsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getInsights(userId: string): Promise<InsightsDto> {
    const [activityData, genreData, totalItems] = await Promise.all([
      this.repository.getActivityData(userId, 365),
      this.repository.getGenreData(userId),
      this.repository.getTotalLibraryItems(userId),
    ]);

    // Most active weekday
    const weekdayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const [date, count] of Object.entries(activityData)) {
      const day = dayNames[new Date(date).getDay()];
      weekdayCounts[day] = (weekdayCounts[day] ?? 0) + count;
    }
    const mostActiveWeekday =
      Object.keys(weekdayCounts).length > 0
        ? (Object.entries(weekdayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'Mon')
        : 'Mon';

    // Favorite genre
    const topGenre = Object.entries(genreData.genreCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    // Most productive month
    const monthCounts: Record<string, number> = {};
    for (const [date, count] of Object.entries(activityData)) {
      const key = date.slice(0, 7);
      monthCounts[key] = (monthCounts[key] ?? 0) + count;
    }
    const mostProductiveMonth = Object.entries(monthCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    // Total hours spent
    const totalHours = Object.values(genreData.genreTime).reduce((a, b) => a + b, 0);

    return {
      mostActiveWeekday,
      favoriteGenre: topGenre,
      mostProductiveMonth,
      totalUniqueMedia: totalItems,
      totalHoursSpent: Math.round(totalHours),
    };
  }
}
