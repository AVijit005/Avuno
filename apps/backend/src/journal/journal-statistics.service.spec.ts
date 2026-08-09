import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { JournalStatisticsService } from './journal-statistics.service';

describe('JournalStatisticsService', () => {
  let service: JournalStatisticsService;
  let repoMock: {
    countEntries: ReturnType<typeof mock>;
    countMemories: ReturnType<typeof mock>;
    countTimelineEvents: ReturnType<typeof mock>;
    countQuotes: ReturnType<typeof mock>;
    countHighlights: ReturnType<typeof mock>;
    getRecentEntryDates: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    repoMock = {
      countEntries: mock(() => Promise.resolve(5)),
      countMemories: mock(() => Promise.resolve(3)),
      countTimelineEvents: mock(() => Promise.resolve(10)),
      countQuotes: mock(() => Promise.resolve(2)),
      countHighlights: mock(() => Promise.resolve(1)),
      getRecentEntryDates: mock(() => Promise.resolve([new Date()])),
    };
    service = new JournalStatisticsService(repoMock as any);
  });

  it('returns all stats aggregations', async () => {
    const result = await service.getStats('user-1');
    expect(result.journalCount).toBe(5);
    expect(result.memoryCount).toBe(3);
    expect(result.timelineEventCount).toBe(10);
    expect(result.favoriteQuoteCount).toBe(2);
    expect(result.highlightCount).toBe(1);
    expect(result.writingStreak).toBeGreaterThanOrEqual(0);
  });

  it('returns zero streak when no entries', async () => {
    repoMock.getRecentEntryDates.mockResolvedValueOnce([]);
    const result = await service.getStats('user-1');
    expect(result.writingStreak).toBe(0);
  });
});
