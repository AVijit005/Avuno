import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let repoMock: {
    searchMedia: ReturnType<typeof mock>;
    searchLibrary: ReturnType<typeof mock>;
    searchJournal: ReturnType<typeof mock>;
    searchCollections: ReturnType<typeof mock>;
    searchMemories: ReturnType<typeof mock>;
    searchQuotes: ReturnType<typeof mock>;
    searchHighlights: ReturnType<typeof mock>;
    searchShelves: ReturnType<typeof mock>;
    searchTimeline: ReturnType<typeof mock>;
    recordSearch: ReturnType<typeof mock>;
    getPrefixSuggestions: ReturnType<typeof mock>;
    getRecentSearches: ReturnType<typeof mock>;
    clearSearchHistory: ReturnType<typeof mock>;
    getTrendingMedia: ReturnType<typeof mock>;
    getFilterOptions: ReturnType<typeof mock>;
  };
  let suggestionMock: {
    getSuggestions: ReturnType<typeof mock>;
    getRecentSearches: ReturnType<typeof mock>;
    clearHistory: ReturnType<typeof mock>;
  };
  let statsMock: {
    getTrending: ReturnType<typeof mock>;
    getFilterOptions: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    repoMock = {
      searchMedia: mock(() => Promise.resolve([])),
      searchLibrary: mock(() => Promise.resolve([])),
      searchJournal: mock(() => Promise.resolve([])),
      searchCollections: mock(() => Promise.resolve([])),
      searchMemories: mock(() => Promise.resolve([])),
      searchQuotes: mock(() => Promise.resolve([])),
      searchHighlights: mock(() => Promise.resolve([])),
      searchShelves: mock(() => Promise.resolve([])),
      searchTimeline: mock(() => Promise.resolve([])),
      recordSearch: mock(() => Promise.resolve()),
      getPrefixSuggestions: mock(() => Promise.resolve([])),
      getRecentSearches: mock(() => Promise.resolve(['recent1', 'recent2'])),
      clearSearchHistory: mock(() => Promise.resolve()),
      getTrendingMedia: mock(() => Promise.resolve([])),
      getFilterOptions: mock(() => Promise.resolve({ types: [], statuses: [], genres: [], years: [], moods: [] })),
    };

    suggestionMock = {
      getSuggestions: mock(() => Promise.resolve({ suggestions: [], recent: [] })),
      getRecentSearches: mock(() => Promise.resolve(['recent1', 'recent2'])),
      clearHistory: mock(() => Promise.resolve()),
    };

    statsMock = {
      getTrending: mock(() => Promise.resolve([])),
      getFilterOptions: mock(() => Promise.resolve({ types: [], statuses: [], genres: [], years: [], moods: [] })),
    };

    service = new SearchService(repoMock as any, suggestionMock as any, statsMock as any);
  });

  it('returns empty results for empty query', async () => {
    const result = await service.search('user-1', { q: '' } as any);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('searches in global mode by default', async () => {
    repoMock.searchMedia.mockResolvedValueOnce([
      {
        id: 'm-1',
        type: 'movie',
        title: 'Test Movie',
        score: 80,
        metadata: null,
        description: null,
        subtitle: null,
        imageUrl: null,
        matchedField: null,
        matchedText: null,
        createdAt: null,
        updatedAt: null,
      },
    ]);
    const result = await service.search('user-1', { q: 'test' } as any);
    expect(result.items).toBeDefined();
    expect(repoMock.recordSearch).toHaveBeenCalledWith('user-1', 'test', expect.any(Object), expect.any(Number));
  });

  it('searches in library mode', async () => {
    repoMock.searchLibrary.mockResolvedValueOnce([]);
    const result = await service.search('user-1', { q: 'test', mode: 'library' } as any);
    expect(result.items).toEqual([]);
  });

  it('searches in media mode', async () => {
    repoMock.searchMedia.mockResolvedValueOnce([]);
    const result = await service.search('user-1', { q: 'test', mode: 'media' } as any);
    expect(result.items).toEqual([]);
  });

  it('returns suggestions', async () => {
    const result = await service.getSuggestions('user-1', 'test');
    expect(result.suggestions).toEqual([]);
  });

  it('returns recent searches', async () => {
    const result = await service.getRecentSearches('user-1');
    expect(result).toContain('recent1');
  });

  it('clears search history', async () => {
    await service.clearSearchHistory('user-1');
    expect(suggestionMock.clearHistory).toHaveBeenCalledWith('user-1');
  });

  it('returns trending', async () => {
    const result = await service.getTrending();
    expect(result).toEqual([]);
  });

  it('returns filter options', async () => {
    const result = await service.getFilterOptions();
    expect(result.types).toEqual([]);
  });
});
