import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { MediaService } from './media.service';
import { MediaRepository, type MediaRow } from './media.repository';

function createMockRow(overrides?: Partial<MediaRow>): MediaRow {
  const now = new Date();
  return {
    id: overrides?.id ?? 'media-1',
    slug: 'test-movie',
    title: 'Test Movie',
    originalTitle: null,
    description: 'A test movie',
    overview: null,
    posterUrl: null,
    backdropUrl: null,
    bannerUrl: null,
    coverImage: null,
    thumbnail: null,
    releaseDate: null,
    releaseYear: 2024,
    runtime: 120,
    duration: null,
    language: 'en',
    country: 'US',
    genres: ['Action', 'Drama'],
    tags: [],
    externalIds: null,
    metadata: null,
    status: 'PUBLISHED',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function createMockMeta() {
  return {
    // Return types are annotated so overrides in individual tests
    // (mockResolvedValueOnce(null), or a populated array) are assignable.
    // Without them TS infers the narrow literal from the default and rejects
    // every override as `never`.
    // MediaRepository.findMany/search resolve to MediaRow[]; the service does
    // the pagination slicing. The previous default returned a {data,hasMore}
    // object, which does not match the repository contract.
    list: mock((): Promise<MediaRow[]> => Promise.resolve([])),
    listByType: mock((): Promise<MediaRow[]> => Promise.resolve([])),
    search: mock((): Promise<MediaRow[]> => Promise.resolve([])),
    findById: mock((): Promise<MediaRow | null> => Promise.resolve(createMockRow())),
    findBySlug: mock((): Promise<MediaRow | null> => Promise.resolve(createMockRow())),
    getRelated: mock((): Promise<MediaRow[]> => Promise.resolve([])),
    getMetadata: mock(() =>
      Promise.resolve({
        posterUrl: null,
        backdropUrl: null,
        bannerUrl: null,
        coverImage: null,
        thumbnail: null,
        runtime: 120,
        duration: null,
        genres: ['Action'],
        studios: [],
        publishers: [],
        developers: [],
        authors: [],
        artists: [],
        episodeCount: null,
        chapterCount: null,
        trackCount: null,
        moduleCount: null,
        externalIds: null,
        extra: null,
      }),
    ),
    toResponse: mock((row: MediaRow) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      originalTitle: null,
      description: null,
      overview: null,
      posterUrl: null,
      backdropUrl: null,
      bannerUrl: null,
      coverImage: null,
      thumbnail: null,
      releaseDate: null,
      releaseYear: 2024,
      runtime: 120,
      duration: null,
      language: 'en',
      country: 'US',
      genres: ['Action'],
      tags: [],
      externalIds: null,
      metadata: null,
      status: 'PUBLISHED',
      mediaType: 'movie',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  };
}

describe('MediaService', () => {
  let service: MediaService;
  let repoMock: ReturnType<typeof createMockMeta>;
  let metaMock: { getMetadata: ReturnType<typeof mock> };
  let slugMock: { generate: ReturnType<typeof mock>; ensureUnique: ReturnType<typeof mock> };

  beforeEach(() => {
    repoMock = createMockMeta();
    metaMock = {
      getMetadata: mock(() =>
        Promise.resolve({
          posterUrl: null,
          backdropUrl: null,
          bannerUrl: null,
          coverImage: null,
          thumbnail: null,
          runtime: 120,
          duration: null,
          genres: ['Action'],
          studios: [],
          publishers: [],
          developers: [],
          authors: [],
          artists: [],
          episodeCount: null,
          chapterCount: null,
          trackCount: null,
          moduleCount: null,
          externalIds: null,
          extra: null,
        }),
      ),
    };
    slugMock = {
      generate: mock(() => 'test-slug'),
      ensureUnique: mock(() => Promise.resolve('test-slug')),
    };

    const repo = {
      findMany: repoMock.list,
      findById: repoMock.findById,
      findBySlug: repoMock.findBySlug,
      findRelated: repoMock.getRelated,
      getMetadata: repoMock.getMetadata,
    } as unknown as MediaRepository;

    service = new MediaService(repo, metaMock as never, slugMock as never);
  });

  describe('findById', () => {
    it('returns a media item for a valid type and id', async () => {
      repoMock.findById.mockResolvedValueOnce(createMockRow({ id: 'movie-1' }));
      const result = await service.findById('movie', 'movie-1');
      expect(result.id).toBe('movie-1');
      expect(result.title).toBe('Test Movie');
    });

    it('throws NotFoundException for invalid media type', async () => {
      try {
        await service.findById('invalid' as never, 'id');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });

    it('throws NotFoundException when item missing', async () => {
      repoMock.findById.mockResolvedValueOnce(null);
      try {
        await service.findById('movie', 'missing');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('movie not found');
      }
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      repoMock.list.mockResolvedValueOnce([createMockRow({ id: 'movie-1' }), createMockRow({ id: 'movie-2' })]);
      const result = await service.list({ limit: 20 });
      expect(result.data).toBeDefined();
      expect(result.hasMore).toBe(false);
    });
  });

  describe('listByType', () => {
    it('returns items filtered by type', async () => {
      repoMock.findById.mockResolvedValueOnce(createMockRow());
      repoMock.list.mockResolvedValueOnce([createMockRow()]);

      const result = await service.listByType('movie', { limit: 20 });
      expect(result.data).toBeDefined();
    });

    it('throws for invalid type', async () => {
      try {
        await service.listByType('invalid' as never, { limit: 20 });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('search', () => {
    it('returns search results', async () => {
      repoMock.list.mockResolvedValueOnce([createMockRow({ id: 'movie-2', title: 'Dark Knight' })]);
      const result = await service.search('dark', { limit: 20 });
      expect(result.data).toBeDefined();
    });
  });

  describe('getRelated', () => {
    it('returns related items', async () => {
      repoMock.getRelated.mockResolvedValueOnce([createMockRow({ id: 'movie-2' })]);
      const result = await service.getRelated('movie', 'movie-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('movie-2');
    });

    it('throws for invalid type', async () => {
      try {
        await service.getRelated('invalid' as never, 'id');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('getMetadata', () => {
    it('returns metadata for an item', async () => {
      const result = await service.getMetadata('movie', 'movie-1');
      expect(result.genres).toEqual(['Action']);
      expect(result.runtime).toBe(120);
    });

    it('throws for invalid type', async () => {
      try {
        await service.getMetadata('invalid' as never, 'id');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('findBySlug', () => {
    it('returns a media item by slug', async () => {
      repoMock.findBySlug.mockResolvedValueOnce(createMockRow({ slug: 'the-dark-knight' }));
      const result = await service.findBySlug('movie', 'the-dark-knight');
      expect(result.slug).toBe('the-dark-knight');
    });

    it('throws for invalid type', async () => {
      try {
        await service.findBySlug('invalid' as never, 'slug');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });
});
