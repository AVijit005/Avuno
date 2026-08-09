import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { WrappedGeneratorService } from './wrapped-generator.service';
import { AnalyticsRepository } from '../analytics/analytics.repository';

describe('WrappedGeneratorService', () => {
  let service: WrappedGeneratorService;
  let mockAnalyticsRepo: any;

  beforeEach(() => {
    mockAnalyticsRepo = {
      countCompletedByType: mock(async () => ({ movie: 10, tvShow: 5, book: 2 })),
      countTotalByType: mock(async () => ({ movie: 15, tvShow: 8, book: 3, game: 1 })),
      getTotalLibraryItems: mock(async () => 27),
      getAverageRating: mock(async () => 4.2),
      getGenreData: mock(async () => ({
        genreCounts: { Action: 12, SciFi: 8, Drama: 5 },
      })),
      getJournalEntryDates: mock(async () => [new Date(), new Date(), new Date()]),
      getHoursAndEpisodesByType: mock(async () => ({
        hours: { movie: 20, tvShow: 10 },
        episodes: { tvShow: 20 },
      })),
    };

    service = new WrappedGeneratorService(mockAnalyticsRepo as unknown as AnalyticsRepository);
  });

  describe('generate', () => {
    it('generates a full wrapped payload for a user', async () => {
      const result = await service.generate('user-1', 2026);

      // Check totals
      expect(result.totalCompleted).toBe(17); // 10 + 5 + 2
      expect(result.totalHours).toBe(30); // 20 + 10
      expect(result.journalCount).toBe(3);

      // Check cards
      expect(result.cards.length).toBe(4);
      expect(result.cards.find((c) => c.type === 'movie')?.stat).toBe('15');
      expect(result.cards.find((c) => c.type === 'game')?.stat).toBe('1');

      // Check stats
      const totalItemsStat = result.stats.find((s) => s.title === 'Total Items');
      expect(totalItemsStat?.value).toBe('27');

      const topGenreStat = result.stats.find((s) => s.title === 'Favorite Genre');
      expect(topGenreStat?.value).toBe('Action');

      const ratingStat = result.stats.find((s) => s.title === 'Average Rating');
      expect(ratingStat?.value).toBe('4.2');

      // Check insights
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.insights.some((i) => i.text.includes('10 movies'))).toBe(true);
      expect(result.insights.some((i) => i.text.includes('Action was your most-watched genre'))).toBe(true);

      // Check summary
      expect(result.summary).toBe('In 2026, you completed 17 items, tracked 27 total, wrote 3 journal entries.');
    });

    it('handles empty states gracefully', async () => {
      mockAnalyticsRepo.countCompletedByType.mockResolvedValue({});
      mockAnalyticsRepo.countTotalByType.mockResolvedValue({});
      mockAnalyticsRepo.getTotalLibraryItems.mockResolvedValue(0);
      mockAnalyticsRepo.getAverageRating.mockResolvedValue(null);
      mockAnalyticsRepo.getGenreData.mockResolvedValue({ genreCounts: {} });
      mockAnalyticsRepo.getJournalEntryDates.mockResolvedValue([]);
      mockAnalyticsRepo.getHoursAndEpisodesByType.mockResolvedValue({ hours: {}, episodes: {} });

      const result = await service.generate('user-empty', 2026);

      expect(result.totalCompleted).toBe(0);
      expect(result.totalHours).toBe(0);
      expect(result.journalCount).toBe(0);
      expect(result.cards.length).toBe(0);
      expect(result.stats.find((s) => s.title === 'Average Rating')?.value).toBe('N/A');
      expect(result.summary).toBe('Your 2026 Chronicle Wrapped is ready.');
    });
  });
});
