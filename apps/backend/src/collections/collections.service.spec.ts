import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { CollectionsService } from './collections.service';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let repoMock: {
    createCollection: ReturnType<typeof mock>;
    findCollectionById: ReturnType<typeof mock>;
    findCollectionsByUserId: ReturnType<typeof mock>;
    updateCollection: ReturnType<typeof mock>;
    softDeleteCollection: ReturnType<typeof mock>;
    collectionExists: ReturnType<typeof mock>;
    addItem: ReturnType<typeof mock>;
    removeItem: ReturnType<typeof mock>;
    reorderItems: ReturnType<typeof mock>;
    createShelf: ReturnType<typeof mock>;
    findShelfById: ReturnType<typeof mock>;
    findShelvesByUserId: ReturnType<typeof mock>;
    updateShelf: ReturnType<typeof mock>;
    softDeleteShelf: ReturnType<typeof mock>;
    shelfExists: ReturnType<typeof mock>;
  };
  let smartMock: { evaluate: ReturnType<typeof mock> };
  let statsMock: { getCollectionStats: ReturnType<typeof mock> };
  let eventsMock: {
    emitCollectionCreated: ReturnType<typeof mock>;
    emitCollectionUpdated: ReturnType<typeof mock>;
    emitCollectionDeleted: ReturnType<typeof mock>;
    emitItemAdded: ReturnType<typeof mock>;
    emitItemRemoved: ReturnType<typeof mock>;
    emitReordered: ReturnType<typeof mock>;
    emitShelfCreated: ReturnType<typeof mock>;
    emitShelfUpdated: ReturnType<typeof mock>;
    emitShelfDeleted: ReturnType<typeof mock>;
  };

  const mockCollection = {
    id: 'col-1',
    userId: 'user-1',
    name: 'Test Collection',
    slug: 'test-collection',
    description: 'A test collection',
    visibility: 'PRIVATE',
    sortOrder: 0,
    isPinned: false,
    isSmartCollection: false,
    icon: null,
    color: null,
    items: [],
    _count: { items: 0 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockShelf = {
    id: 'shelf-1',
    userId: 'user-1',
    title: 'Test Shelf',
    slug: 'test-shelf',
    description: 'A test shelf',
    visibility: 'PRIVATE',
    sortOrder: 0,
    isPinned: false,
    icon: null,
    color: null,
    items: [],
    _count: { items: 0 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockItem = {
    id: 'item-1',
    collectionId: 'col-1',
    movieId: 'movie-1',
    position: 0,
    note: null,
    addedAt: new Date(),
    movie: { id: 'movie-1', slug: 'test-movie', title: 'Test Movie', posterUrl: null },
  };

  beforeEach(() => {
    repoMock = {
      createCollection: mock(() => Promise.resolve({ ...mockCollection })),
      findCollectionById: mock(() => Promise.resolve({ ...mockCollection, items: [] })),
      findCollectionsByUserId: mock(() => Promise.resolve([{ ...mockCollection, _count: { items: 0 } }])),
      updateCollection: mock(() => Promise.resolve({ ...mockCollection })),
      softDeleteCollection: mock(() => Promise.resolve(true)),
      collectionExists: mock(() => Promise.resolve(false)),
      addItem: mock(() => Promise.resolve({ ...mockItem })),
      removeItem: mock(() => Promise.resolve(true)),
      reorderItems: mock(() => Promise.resolve(true)),
      createShelf: mock(() => Promise.resolve({ ...mockShelf })),
      findShelfById: mock(() => Promise.resolve({ ...mockShelf, items: [] })),
      findShelvesByUserId: mock(() => Promise.resolve([{ ...mockShelf, _count: { items: 0 } }])),
      updateShelf: mock(() => Promise.resolve({ ...mockShelf })),
      softDeleteShelf: mock(() => Promise.resolve(true)),
      shelfExists: mock(() => Promise.resolve(false)),
    };
    smartMock = { evaluate: mock(() => Promise.resolve([])) };
    statsMock = {
      getCollectionStats: mock(() =>
        Promise.resolve({
          totalItems: 0,
          completed: 0,
          favoriteCount: 0,
          completionPercent: 0,
          mediaTypeBreakdown: {},
        }),
      ),
    };
    eventsMock = {
      emitCollectionCreated: mock(() => Promise.resolve()),
      emitCollectionUpdated: mock(() => Promise.resolve()),
      emitCollectionDeleted: mock(() => Promise.resolve()),
      emitItemAdded: mock(() => Promise.resolve()),
      emitItemRemoved: mock(() => Promise.resolve()),
      emitReordered: mock(() => Promise.resolve()),
      emitShelfCreated: mock(() => Promise.resolve()),
      emitShelfUpdated: mock(() => Promise.resolve()),
      emitShelfDeleted: mock(() => Promise.resolve()),
    };

    service = new CollectionsService(repoMock as any, smartMock as any, statsMock as any, eventsMock as any);
  });

  // ─── Collections CRUD ─────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a collection and emits event', async () => {
      const result = await service.create('user-1', { name: 'Test Collection' });
      expect(result.name).toBe('Test Collection');
      expect(result.slug).toBe('test-collection');
      expect(eventsMock.emitCollectionCreated).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when slug exists', async () => {
      repoMock.collectionExists.mockResolvedValueOnce(true);
      try {
        await service.create('user-1', { name: 'Test Collection' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('A collection with this name already exists');
      }
    });
  });

  describe('findAll', () => {
    it('returns all collections for user', async () => {
      const result = await service.findAll('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Collection');
    });
  });

  describe('findOne', () => {
    it('returns a collection with items', async () => {
      const result = await service.findOne('col-1', 'user-1');
      expect(result.name).toBe('Test Collection');
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.findCollectionById.mockResolvedValueOnce(null);
      try {
        await service.findOne('missing', 'user-1');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Collection not found');
      }
    });
  });

  describe('update', () => {
    it('updates a collection and emits event', async () => {
      const result = await service.update('col-1', 'user-1', { name: 'Updated' });
      expect(result.name).toBe('Test Collection');
      expect(eventsMock.emitCollectionUpdated).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.updateCollection.mockResolvedValueOnce(null);
      try {
        await service.update('missing', 'user-1', { name: 'Updated' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Collection not found');
      }
    });
  });

  describe('remove', () => {
    it('deletes a collection and emits event', async () => {
      await service.remove('col-1', 'user-1');
      expect(eventsMock.emitCollectionDeleted).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.softDeleteCollection.mockResolvedValueOnce(false);
      try {
        await service.remove('missing', 'user-1');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Collection not found');
      }
    });
  });

  // ─── Collection Items ─────────────────────────────────────────────────────

  describe('addItem', () => {
    it('adds an item and emits event', async () => {
      const result = await service.addItem('col-1', 'user-1', { mediaId: 'movie-1', mediaType: 'movie' });
      expect(result.mediaId).toBe('movie-1');
      expect(eventsMock.emitItemAdded).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException for duplicate', async () => {
      repoMock.addItem.mockResolvedValueOnce(null);
      try {
        await service.addItem('col-1', 'user-1', { mediaId: 'movie-1', mediaType: 'movie' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Item already exists in this collection');
      }
    });
  });

  describe('removeItem', () => {
    it('removes an item and emits event', async () => {
      await service.removeItem('col-1', 'item-1', 'user-1');
      expect(eventsMock.emitItemRemoved).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.removeItem.mockResolvedValueOnce(false);
      try {
        await service.removeItem('col-1', 'missing', 'user-1');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Item not found');
      }
    });
  });

  describe('reorderItems', () => {
    it('reorders items and emits event', async () => {
      await service.reorderItems('col-1', 'user-1', { itemIds: ['item-1', 'item-2'] });
      expect(eventsMock.emitReordered).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when collection missing', async () => {
      repoMock.findCollectionById.mockResolvedValueOnce(null);
      try {
        await service.reorderItems('missing', 'user-1', { itemIds: [] });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Collection not found');
      }
    });
  });

  // ─── Shelves CRUD ─────────────────────────────────────────────────────────

  describe('createShelf', () => {
    it('creates a shelf and emits event', async () => {
      const result = await service.createShelf('user-1', { title: 'Test Shelf' });
      expect(result.title).toBe('Test Shelf');
      expect(eventsMock.emitShelfCreated).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when slug exists', async () => {
      repoMock.shelfExists.mockResolvedValueOnce(true);
      try {
        await service.createShelf('user-1', { title: 'Test Shelf' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('A shelf with this name already exists');
      }
    });
  });

  describe('findAllShelves', () => {
    it('returns all shelves', async () => {
      const result = await service.findAllShelves('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOneShelf', () => {
    it('returns a shelf with items', async () => {
      const result = await service.findOneShelf('shelf-1', 'user-1');
      expect(result.title).toBe('Test Shelf');
    });

    it('throws NotFoundException when missing', async () => {
      repoMock.findShelfById.mockResolvedValueOnce(null);
      try {
        await service.findOneShelf('missing', 'user-1');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Shelf not found');
      }
    });
  });

  describe('updateShelf', () => {
    it('updates a shelf and emits event', async () => {
      const result = await service.updateShelf('shelf-1', 'user-1', { title: 'Updated' });
      expect(result.title).toBe('Test Shelf');
      expect(eventsMock.emitShelfUpdated).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeShelf', () => {
    it('deletes a shelf and emits event', async () => {
      await service.removeShelf('shelf-1', 'user-1');
      expect(eventsMock.emitShelfDeleted).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Statistics ───────────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns collection statistics', async () => {
      const result = await service.getStatistics('col-1', 'user-1');
      expect(result).toBeDefined();
      expect(result.totalItems).toBe(0);
    });
  });
});
