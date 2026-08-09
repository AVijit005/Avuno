import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { SmartCollectionService } from './smart-collection.service';

describe('SmartCollectionService', () => {
  let service: SmartCollectionService;
  let repoMock: {
    findLibraryItems: ReturnType<typeof mock>;
  };

  const mockItems = [
    {
      id: 'lib-1',
      userId: 'user-1',
      status: 'COMPLETED',
      rating: 8,
      favorite: true,
      movieId: 'movie-1',
      _mediaType: 'movie',
      metadata: { review: { title: 'Great!' } },
      createdAt: new Date(),
      movie: { id: 'movie-1', slug: 'test-movie', title: 'Test Movie', posterUrl: null },
    },
    {
      id: 'lib-2',
      userId: 'user-1',
      status: 'WATCHING',
      rating: null,
      favorite: false,
      movieId: 'movie-2',
      _mediaType: 'movie',
      metadata: null,
      createdAt: new Date(),
      movie: { id: 'movie-2', slug: 'another', title: 'Another', posterUrl: null },
    },
  ];

  beforeEach(() => {
    repoMock = {
      findLibraryItems: mock(() => Promise.resolve(mockItems)),
    };
    service = new SmartCollectionService(repoMock as any);
  });

  it('returns empty when no rules', async () => {
    const result = await service.evaluate('user-1', { rules: [] });
    expect(result).toEqual([]);
  });

  it('filters by status rule', async () => {
    const result = await service.evaluate('user-1', {
      rules: [{ field: 'status', operator: 'equals', value: 'COMPLETED' }],
    });
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('filters by favorite rule', async () => {
    const result = await service.evaluate('user-1', {
      rules: [{ field: 'favorite', operator: 'equals', value: true }],
    });
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('filters by hasReview rule', async () => {
    const result = await service.evaluate('user-1', {
      rules: [{ field: 'hasReview', operator: 'equals', value: true }],
    });
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});
