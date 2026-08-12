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

  it('returns all stats aggregations for multiple records', async () => {
    const result = await service.getStats('user-1');
    expect(result.journalCount).toBe(5);
    expect(result.memoryCount).toBe(3);
    expect(result.timelineEventCount).toBe(10);
    expect(result.favoriteQuoteCount).toBe(2);
    expect(result.highlightCount).toBe(1);
    expect(result.writingStreak).toBeGreaterThanOrEqual(0);
  });

  it('returns all stats aggregations for 0 records', async () => {
    repoMock.countEntries.mockResolvedValueOnce(0);
    repoMock.countMemories.mockResolvedValueOnce(0);
    repoMock.countTimelineEvents.mockResolvedValueOnce(0);
    repoMock.countQuotes.mockResolvedValueOnce(0);
    repoMock.countHighlights.mockResolvedValueOnce(0);
    repoMock.getRecentEntryDates.mockResolvedValueOnce([]);

    const result = await service.getStats('user-1');
    expect(result.journalCount).toBe(0);
    expect(result.memoryCount).toBe(0);
    expect(result.timelineEventCount).toBe(0);
    expect(result.favoriteQuoteCount).toBe(0);
    expect(result.highlightCount).toBe(0);
    expect(result.writingStreak).toBe(0);
  });

  it('returns all stats aggregations for 1 record', async () => {
    repoMock.countEntries.mockResolvedValueOnce(1);
    repoMock.countMemories.mockResolvedValueOnce(1);
    repoMock.countTimelineEvents.mockResolvedValueOnce(1);
    repoMock.countQuotes.mockResolvedValueOnce(1);
    repoMock.countHighlights.mockResolvedValueOnce(1);
    repoMock.getRecentEntryDates.mockResolvedValueOnce([new Date()]);

    const result = await service.getStats('user-1');
    expect(result.journalCount).toBe(1);
    expect(result.memoryCount).toBe(1);
    expect(result.timelineEventCount).toBe(1);
    expect(result.favoriteQuoteCount).toBe(1);
    expect(result.highlightCount).toBe(1);
    expect(result.writingStreak).toBe(1);
  });

  it('returns zero streak when no entries', async () => {
    repoMock.getRecentEntryDates.mockResolvedValueOnce([]);
    const result = await service.getStats('user-1');
    expect(result.writingStreak).toBe(0);
  });
});
