import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { LibraryService } from './library.service';
import { type LibraryRow } from './library.repository';

function createMockRow(overrides?: Partial<LibraryRow>): LibraryRow {
  const now = new Date();
  return {
    id: 'lib-1',
    userId: 'user-1',
    status: 'PLANNING',
    rating: null,
    rewatchCount: null,
    favorite: false,
    hidden: false,
    private: false,
    notes: null,
    startedAt: null,
    finishedAt: null,
    lastInteractionAt: null,
    progress: null,
    progressPercentage: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

describe('LibraryService', () => {
  let service: LibraryService;
  let repoMock: {
    verifyMediaExists: ReturnType<typeof mock>;
    findByUserIdAndMediaId: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    findAll: ReturnType<typeof mock>;
    findById: ReturnType<typeof mock>;
    update: ReturnType<typeof mock>;
    softDelete: ReturnType<typeof mock>;
    countByStatus: ReturnType<typeof mock>;
    countByType: ReturnType<typeof mock>;
  };
  let statsMock: {
    getStatistics: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    repoMock = {
      verifyMediaExists: mock(() => Promise.resolve(true)),
      findByUserIdAndMediaId: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve(createMockRow({ id: 'lib-new', status: 'PLANNING' }))),
      findAll: mock(() => Promise.resolve([createMockRow()])),
      findById: mock(() => Promise.resolve(createMockRow({ userId: 'user-1' }))),
      update: mock(() => Promise.resolve(createMockRow({ userId: 'user-1', status: 'COMPLETED' }))),
      softDelete: mock(() => Promise.resolve(true)),
      countByStatus: mock(() => Promise.resolve({ COMPLETED: 5, PLANNING: 3, WATCHING: 2 })),
      countByType: mock(() => Promise.resolve({ movie: 10 })),
    };
    statsMock = {
      getStatistics: mock(() =>
        Promise.resolve({
          total: 10,
          byStatus: { COMPLETED: 5, PLANNING: 3, WATCHING: 2 },
          byType: { movie: 10 },
          favoriteCount: 0,
          completionRate: 50,
        }),
      ),
    };

    service = new LibraryService(repoMock as never, statsMock as never);
  });

  describe('add', () => {
    it('creates a library entry', async () => {
      const result = await service.add('user-1', { mediaType: 'movie', mediaId: 'movie-1' });
      expect(result.id).toBe('lib-new');
      expect(result.status).toBe('PLANNING');
    });

    it('throws ConflictException for duplicate', async () => {
      const error = new Error('Unique constraint failed');
      (error as any).code = 'P2002';
      repoMock.create.mockRejectedValueOnce(error);
      try {
        await service.add('user-1', { mediaType: 'movie', mediaId: 'movie-1' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Item already exists in library');
      }
    });

    it('throws NotFoundException for missing media', async () => {
      repoMock.verifyMediaExists.mockResolvedValueOnce(false);
      try {
        await service.add('user-1', { mediaType: 'movie', mediaId: 'missing' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('movie with id missing not found');
      }
    });

    it('throws NotFoundException for invalid type', async () => {
      try {
        await service.add('user-1', { mediaType: 'invalid' as never, mediaId: 'id' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('list', () => {
    it('returns paginated items', async () => {
      const result = await service.list('user-1', undefined, { limit: 20 });
      expect(result.data).toBeDefined();
      expect(result.hasMore).toBe(false);
    });
  });

  describe('findById', () => {
    it('returns a library item', async () => {
      const result = await service.findById('user-1', 'lib-1', 'movie');
      expect(result.id).toBe('lib-1');
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.findById.mockResolvedValueOnce(null);
      try {
        await service.findById('user-1', 'missing', 'movie');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Library item not found');
      }
    });
  });

  describe('update', () => {
    it('updates a library item', async () => {
      repoMock.update.mockResolvedValueOnce(createMockRow({ userId: 'user-1', status: 'COMPLETED' }));
      const result = await service.update('user-1', 'lib-1', 'movie', { status: 'COMPLETED' });
      expect(result.status).toBe('COMPLETED');
    });

    it('throws NotFoundException when not found', async () => {
      repoMock.update.mockResolvedValueOnce(null);
      try {
        await service.update('user-1', 'missing', 'movie', { status: 'COMPLETED' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Library item not found');
      }
    });

    it('throws NotFoundException for invalid type', async () => {
      try {
        await service.update('user-1', 'lib-1', 'invalid' as never, { status: 'COMPLETED' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('remove', () => {
    it('soft deletes a library item', async () => {
      repoMock.softDelete.mockResolvedValueOnce(true);
      await service.remove('user-1', 'lib-1', 'movie');
      expect(repoMock.softDelete).toHaveBeenCalledWith('lib-1', 'user-1', 'movie');
    });

    it('throws NotFoundException when not found', async () => {
      repoMock.softDelete.mockResolvedValueOnce(false);
      try {
        await service.remove('user-1', 'missing', 'movie');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Library item not found');
      }
    });

    it('throws NotFoundException for invalid type', async () => {
      try {
        await service.remove('user-1', 'lib-1', 'invalid' as never);
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Invalid media type: invalid');
      }
    });
  });

  describe('getStatistics', () => {
    it('returns statistics', async () => {
      const result = await service.getStatistics('user-1');
      expect(result.total).toBe(10);
      expect(result.completionRate).toBe(50);
    });
  });
});
