import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { JournalService } from './journal.service';

describe('JournalService', () => {
  let service: JournalService;
  let repoMock: {
    createEntry: ReturnType<typeof mock>;
    findEntryById: ReturnType<typeof mock>;
    findEntriesByUserId: ReturnType<typeof mock>;
    updateEntry: ReturnType<typeof mock>;
    deleteEntry: ReturnType<typeof mock>;
    createMemory: ReturnType<typeof mock>;
    findMemoryById: ReturnType<typeof mock>;
    findMemoriesByUserId: ReturnType<typeof mock>;
    updateMemory: ReturnType<typeof mock>;
    deleteMemory: ReturnType<typeof mock>;
    createTimelineEvent: ReturnType<typeof mock>;
    findTimelineEvents: ReturnType<typeof mock>;
    createQuote: ReturnType<typeof mock>;
    findQuotesByUserId: ReturnType<typeof mock>;
    updateQuote: ReturnType<typeof mock>;
    deleteQuote: ReturnType<typeof mock>;
    createHighlight: ReturnType<typeof mock>;
    findHighlightsByUserId: ReturnType<typeof mock>;
    updateHighlight: ReturnType<typeof mock>;
    deleteHighlight: ReturnType<typeof mock>;
    countEntries: ReturnType<typeof mock>;
    countMemories: ReturnType<typeof mock>;
    countTimelineEvents: ReturnType<typeof mock>;
    countQuotes: ReturnType<typeof mock>;
    countHighlights: ReturnType<typeof mock>;
    getRecentEntryDates: ReturnType<typeof mock>;
  };
  let eventsMock: Record<string, ReturnType<typeof mock>>;
  let timelineMock: Record<string, ReturnType<typeof mock>>;
  let statsMock: { getStats: ReturnType<typeof mock> };

  const mockEntry = {
    id: 'entry-1',
    userId: 'user-1',
    title: 'Test Entry',
    content: 'Some content',
    mood: null,
    weather: null,
    location: null,
    isPrivate: true,
    coverImage: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
  const mockMemory = {
    id: 'mem-1',
    userId: 'user-1',
    title: 'Test Memory',
    description: null,
    memoryDate: null,
    emotion: null,
    isPinned: false,
    isPrivate: true,
    coverImage: null,
    location: null,
    _count: { media: 0 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
  const mockEvent = {
    id: 'evt-1',
    userId: 'user-1',
    type: 'JOURNAL_CREATED',
    title: 'Test',
    description: null,
    eventDate: new Date(),
    icon: null,
    color: null,
    metadata: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    repoMock = {
      createEntry: mock(() => Promise.resolve({ ...mockEntry })),
      findEntryById: mock(() => Promise.resolve({ ...mockEntry })),
      findEntriesByUserId: mock(() => Promise.resolve([{ ...mockEntry }])),
      updateEntry: mock(() => Promise.resolve({ ...mockEntry })),
      deleteEntry: mock(() => Promise.resolve(true)),
      createMemory: mock(() => Promise.resolve({ ...mockMemory })),
      findMemoryById: mock(() => Promise.resolve({ ...mockMemory })),
      findMemoriesByUserId: mock(() => Promise.resolve([{ ...mockMemory }])),
      updateMemory: mock(() => Promise.resolve({ ...mockMemory })),
      deleteMemory: mock(() => Promise.resolve(true)),
      createTimelineEvent: mock(() => Promise.resolve({ ...mockEvent })),
      findTimelineEvents: mock(() => Promise.resolve([{ ...mockEvent }])),
      createQuote: mock(() =>
        Promise.resolve({
          id: 'quote-1',
          userId: 'user-1',
          content: 'Test quote',
          speaker: null,
          language: null,
          translation: null,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
      findQuotesByUserId: mock(() => Promise.resolve([])),
      updateQuote: mock(() => Promise.resolve({ id: 'quote-1', content: 'Updated' })),
      deleteQuote: mock(() => Promise.resolve(true)),
      createHighlight: mock(() =>
        Promise.resolve({
          id: 'hl-1',
          userId: 'user-1',
          title: 'Test HL',
          description: null,
          timestamp: null,
          chapter: null,
          page: null,
          episode: null,
          season: null,
          track: null,
          lesson: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
      findHighlightsByUserId: mock(() => Promise.resolve([])),
      updateHighlight: mock(() => Promise.resolve({ id: 'hl-1', title: 'Updated' })),
      deleteHighlight: mock(() => Promise.resolve(true)),
      countEntries: mock(() => Promise.resolve(5)),
      countMemories: mock(() => Promise.resolve(3)),
      countTimelineEvents: mock(() => Promise.resolve(10)),
      countQuotes: mock(() => Promise.resolve(2)),
      countHighlights: mock(() => Promise.resolve(1)),
      getRecentEntryDates: mock(() => Promise.resolve([new Date()])),
    };

    eventsMock = {
      emitJournalCreated: mock(() => Promise.resolve()),
      emitJournalUpdated: mock(() => Promise.resolve()),
      emitJournalDeleted: mock(() => Promise.resolve()),
      emitMemoryCreated: mock(() => Promise.resolve()),
      emitMemoryUpdated: mock(() => Promise.resolve()),
      emitMemoryDeleted: mock(() => Promise.resolve()),
      emitQuoteCreated: mock(() => Promise.resolve()),
      emitQuoteUpdated: mock(() => Promise.resolve()),
      emitQuoteDeleted: mock(() => Promise.resolve()),
      emitHighlightCreated: mock(() => Promise.resolve()),
      emitHighlightUpdated: mock(() => Promise.resolve()),
      emitHighlightDeleted: mock(() => Promise.resolve()),
    };

    timelineMock = {
      createEvent: mock(() => Promise.resolve()),
      fromJournalEntry: mock(() => ({
        type: 'JOURNAL_CREATED',
        title: 'Test',
        description: null,
        eventDate: new Date(),
        icon: null,
        color: null,
        metadata: null,
      })),
      fromMemory: mock(() => ({
        type: 'MEMORY_CREATED',
        title: 'Memory',
        description: null,
        eventDate: new Date(),
        icon: null,
        color: null,
        metadata: null,
      })),
      fromQuote: mock(() => ({
        type: 'QUOTE_ADDED',
        title: 'Quote',
        description: null,
        eventDate: new Date(),
        icon: null,
        color: null,
        metadata: null,
      })),
      fromHighlight: mock(() => ({
        type: 'HIGHLIGHT_ADDED',
        title: 'Highlight',
        description: null,
        eventDate: new Date(),
        icon: null,
        color: null,
        metadata: null,
      })),
    };

    statsMock = {
      getStats: mock(() =>
        Promise.resolve({
          journalCount: 5,
          memoryCount: 3,
          writingStreak: 1,
          timelineEventCount: 10,
          favoriteQuoteCount: 2,
          highlightCount: 1,
        }),
      ),
    };

    service = new JournalService(
      repoMock as any,
      eventsMock as any,
      timelineMock as any,
      statsMock as any,
      { getAllPrompts: () => [], getDailyPrompt: () => '' } as any,
    );
  });

  // ─── Journal Entries ──────────────────────────────────────────────────────

  it('creates a journal entry and emits event', async () => {
    const result = await service.createEntry('user-1', { content: 'My entry', title: 'Test' });
    expect(result.title).toBe('Test Entry');
    expect(eventsMock.emitJournalCreated).toHaveBeenCalledTimes(1);
  });

  it('finds all entries', async () => {
    const result = await service.findEntries('user-1');
    expect(result.items).toHaveLength(1);
  });

  it('finds entry by id', async () => {
    const result = await service.findEntry('entry-1', 'user-1');
    expect(result.id).toBe('entry-1');
  });

  it('throws on missing entry', async () => {
    repoMock.findEntryById.mockResolvedValueOnce(null);
    try {
      await service.findEntry('missing', 'user-1');
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message).toBe('Journal entry not found');
    }
  });

  it('updates an entry', async () => {
    const result = await service.updateEntry('entry-1', 'user-1', { title: 'Updated' });
    expect(result.title).toBe('Test Entry');
    expect(eventsMock.emitJournalUpdated).toHaveBeenCalledTimes(1);
  });

  it('deletes an entry', async () => {
    await service.deleteEntry('entry-1', 'user-1');
    expect(eventsMock.emitJournalDeleted).toHaveBeenCalledTimes(1);
  });

  it('throws on delete of missing entry', async () => {
    repoMock.deleteEntry.mockResolvedValueOnce(false);
    try {
      await service.deleteEntry('missing', 'user-1');
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message).toBe('Journal entry not found');
    }
  });

  // ─── Memories ─────────────────────────────────────────────────────────────

  it('creates a memory and emits event', async () => {
    const result = await service.createMemory('user-1', { title: 'My Memory' });
    expect(result.title).toBe('Test Memory');
    expect(eventsMock.emitMemoryCreated).toHaveBeenCalledTimes(1);
  });

  it('finds all memories', async () => {
    const result = await service.findMemories('user-1');
    expect(result.items).toHaveLength(1);
  });

  it('updates a memory', async () => {
    const result = await service.updateMemory('mem-1', 'user-1', { title: 'Updated' });
    expect(result.title).toBe('Test Memory');
    expect(eventsMock.emitMemoryUpdated).toHaveBeenCalledTimes(1);
  });

  it('deletes a memory', async () => {
    await service.deleteMemory('mem-1', 'user-1');
    expect(eventsMock.emitMemoryDeleted).toHaveBeenCalledTimes(1);
  });

  // ─── Timeline ─────────────────────────────────────────────────────────────

  it('creates a manual timeline event', async () => {
    const result = await service.createTimelineEvent('user-1', {
      type: 'JOURNAL_CREATED',
      title: 'Test',
      eventDate: '2024-01-01',
    });
    expect(result.type).toBe('JOURNAL_CREATED');
  });

  it('finds timeline events', async () => {
    const result = await service.findTimelineEvents('user-1');
    expect(result.items).toHaveLength(1);
  });

  // ─── Statistics ───────────────────────────────────────────────────────────

  it('returns statistics', async () => {
    const result = await service.getStatistics('user-1');
    expect(result.journalCount).toBe(5);
    expect(result.writingStreak).toBe(1);
  });
});
