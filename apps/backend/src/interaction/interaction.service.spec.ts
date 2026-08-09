import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { InteractionService } from './interaction.service';

describe('InteractionService', () => {
  let service: InteractionService;
  let repoMock: {
    findLibraryItem: ReturnType<typeof mock>;
    updateLibraryItem: ReturnType<typeof mock>;
    recordHistory: ReturnType<typeof mock>;
    findFavorites: ReturnType<typeof mock>;
    findBookmarks: ReturnType<typeof mock>;
    findWithReviews: ReturnType<typeof mock>;
    findHistory: ReturnType<typeof mock>;
  };
  let eventsMock: {
    emitRatingAdded: ReturnType<typeof mock>;
    emitRatingUpdated: ReturnType<typeof mock>;
    emitReviewCreated: ReturnType<typeof mock>;
    emitReviewUpdated: ReturnType<typeof mock>;
    emitReviewDeleted: ReturnType<typeof mock>;
    emitFavoriteAdded: ReturnType<typeof mock>;
    emitFavoriteRemoved: ReturnType<typeof mock>;
    emitBookmarkAdded: ReturnType<typeof mock>;
    emitBookmarkRemoved: ReturnType<typeof mock>;
    emitHistoryRecorded: ReturnType<typeof mock>;
  };

  const mockItem = {
    id: 'lib-1',
    userId: 'user-1',
    rating: null,
    favorite: false,
    metadata: null,
    status: 'COMPLETED',
    movieId: 'movie-1',
    startedAt: new Date('2024-01-01'),
    finishedAt: new Date('2024-01-15'),
    lastInteractionAt: new Date('2024-01-15'),
    progress: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    deletedAt: null,
    movie: { id: 'movie-1', slug: 'test-movie', title: 'Test Movie', posterUrl: null },
  };

  beforeEach(() => {
    repoMock = {
      findLibraryItem: mock(() => Promise.resolve({ ...mockItem })),
      updateLibraryItem: mock(() => Promise.resolve({ ...mockItem, rating: 8, favorite: true })),
      recordHistory: mock(() => Promise.resolve()),
      findFavorites: mock(() => Promise.resolve([])),
      findBookmarks: mock(() => Promise.resolve([])),
      findWithReviews: mock(() => Promise.resolve([])),
      findHistory: mock(() => Promise.resolve([])),
    };
    eventsMock = {
      emitRatingAdded: mock(() => Promise.resolve()),
      emitRatingUpdated: mock(() => Promise.resolve()),
      emitReviewCreated: mock(() => Promise.resolve()),
      emitReviewUpdated: mock(() => Promise.resolve()),
      emitReviewDeleted: mock(() => Promise.resolve()),
      emitFavoriteAdded: mock(() => Promise.resolve()),
      emitFavoriteRemoved: mock(() => Promise.resolve()),
      emitBookmarkAdded: mock(() => Promise.resolve()),
      emitBookmarkRemoved: mock(() => Promise.resolve()),
      emitHistoryRecorded: mock(() => Promise.resolve()),
    };

    service = new InteractionService(repoMock as any, eventsMock as any);
  });

  // ─── Rating ─────────────────────────────────────────────────────────────────

  describe('updateRating', () => {
    it('sets a new rating and emits RatingAdded', async () => {
      const result = await service.updateRating('user-1', 'lib-1', 'movie', { rating: 4.5 });
      expect(result.rating).toBe(4.5);
      expect(eventsMock.emitRatingAdded).toHaveBeenCalledTimes(1);
      expect(repoMock.recordHistory).toHaveBeenCalledWith('user-1', 'RATED', 'lib-1', 'movie', expect.any(Object));
    });

    it('throws NotFoundException when item missing', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce(null);
      try {
        await service.updateRating('user-1', 'missing', 'movie', { rating: 4 });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Library item not found');
      }
    });

    it('throws NotFoundException when userId does not match', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, userId: 'other-user' });
      try {
        await service.updateRating('user-1', 'lib-1', 'movie', { rating: 4 });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('Library item not found');
      }
    });
  });

  describe('getRating', () => {
    it('returns the current rating', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, rating: 8 });
      const result = await service.getRating('user-1', 'lib-1', 'movie');
      expect(result.rating).toBe(4);
    });

    it('returns null rating when unrated', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, rating: null });
      const result = await service.getRating('user-1', 'lib-1', 'movie');
      expect(result.rating).toBeNull();
    });
  });

  // ─── Favorite ───────────────────────────────────────────────────────────────

  describe('toggleFavorite', () => {
    it('adds a favorite and emits FavoriteAdded', async () => {
      const result = await service.toggleFavorite('user-1', 'lib-1', 'movie', { favorite: true });
      expect(result.favorite).toBe(true);
      expect(result.favoritedAt).toBeTruthy();
      expect(eventsMock.emitFavoriteAdded).toHaveBeenCalledTimes(1);
    });

    it('removes a favorite and emits FavoriteRemoved', async () => {
      repoMock.updateLibraryItem.mockResolvedValueOnce({ ...mockItem, favorite: false });
      const result = await service.toggleFavorite('user-1', 'lib-1', 'movie', { favorite: false });
      expect(result.favorite).toBe(false);
      expect(result.favoritedAt).toBeNull();
      expect(eventsMock.emitFavoriteRemoved).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFavorite', () => {
    it('returns favorite status', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, favorite: true });
      const result = await service.getFavorite('user-1', 'lib-1', 'movie');
      expect(result.favorite).toBe(true);
    });
  });

  // ─── Bookmark ───────────────────────────────────────────────────────────────

  describe('toggleBookmark', () => {
    it('adds a bookmark and emits BookmarkAdded', async () => {
      const bookmarkTime = new Date();
      repoMock.updateLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        bookmarked: true,
        bookmarkedAt: bookmarkTime,
      });
      const result = await service.toggleBookmark('user-1', 'lib-1', 'movie', { bookmark: true });
      expect(result.bookmarked).toBe(true);
      expect(result.bookmarkedAt).toBeTruthy();
      expect(eventsMock.emitBookmarkAdded).toHaveBeenCalledTimes(1);
    });

    it('removes a bookmark and emits BookmarkRemoved', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        bookmarked: true,
        bookmarkedAt: new Date(),
      });
      repoMock.updateLibraryItem.mockResolvedValueOnce({ ...mockItem, bookmarked: false, bookmarkedAt: null });
      const result = await service.toggleBookmark('user-1', 'lib-1', 'movie', { bookmark: false });
      expect(result.bookmarked).toBe(false);
      expect(result.bookmarkedAt).toBeNull();
      expect(eventsMock.emitBookmarkRemoved).toHaveBeenCalledTimes(1);
    });

    it('preserves bookmarkedAt when other fields change', async () => {
      const bookmarkTime = new Date('2026-01-15');
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        bookmarked: true,
        bookmarkedAt: bookmarkTime,
      });
      // Simulate a rating update (not a bookmark update)
      repoMock.updateLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        bookmarked: true,
        bookmarkedAt: bookmarkTime,
        rating: 5,
        updatedAt: new Date(), // updatedAt changes, but bookmarkedAt should not
      });
      const result = await service.getBookmark('user-1', 'lib-1', 'movie');
      expect(result.bookmarked).toBe(true);
      expect(result.bookmarkedAt).toBe(bookmarkTime.toISOString());
    });
  });

  describe('getBookmark', () => {
    it('returns bookmarked status', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        bookmarked: true,
        bookmarkedAt: new Date(),
      });
      const result = await service.getBookmark('user-1', 'lib-1', 'movie');
      expect(result.bookmarked).toBe(true);
    });

    it('returns not bookmarked when bookmarked is false', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, bookmarked: false, bookmarkedAt: null });
      const result = await service.getBookmark('user-1', 'lib-1', 'movie');
      expect(result.bookmarked).toBe(false);
      expect(result.bookmarkedAt).toBeNull();
    });
  });

  // ─── Review ─────────────────────────────────────────────────────────────────

  describe('createReview', () => {
    it('creates a review and emits ReviewCreated', async () => {
      repoMock.updateLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: {
          review: {
            title: 'Great movie',
            body: 'Loved it',
            spoiler: false,
            visibility: 'PUBLIC',
            createdAt: new Date().toISOString(),
            editedAt: null,
          },
        },
      });
      const result = await service.createReview('user-1', 'lib-1', 'movie', {
        title: 'Great movie',
        body: 'Loved it',
        spoiler: false,
        visibility: 'PUBLIC',
      });
      expect(result.title).toBe('Great movie');
      expect(result.body).toBe('Loved it');
      expect(result.spoiler).toBe(false);
      expect(result.visibility).toBe('PUBLIC');
      expect(eventsMock.emitReviewCreated).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when review already exists', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: { review: { title: 'Existing' } },
      });
      try {
        await service.createReview('user-1', 'lib-1', 'movie', {
          title: 'Another',
          body: 'body',
          spoiler: false,
          visibility: 'PUBLIC',
        });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('A review already exists for this item');
      }
    });
  });

  describe('updateReview', () => {
    it('updates a review and emits ReviewUpdated', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: {
          review: {
            title: 'Old title',
            body: 'Old body',
            spoiler: false,
            visibility: 'PUBLIC',
            createdAt: '2024-01-01T00:00:00.000Z',
            editedAt: null,
          },
        },
      });
      repoMock.updateLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: {
          review: {
            title: 'Updated title',
            body: 'Old body',
            spoiler: false,
            visibility: 'PUBLIC',
            createdAt: '2024-01-01T00:00:00.000Z',
            editedAt: new Date().toISOString(),
          },
        },
      });
      const result = await service.updateReview('user-1', 'lib-1', 'movie', { title: 'Updated title' });
      expect(result.title).toBe('Updated title');
      expect(eventsMock.emitReviewUpdated).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when no review exists', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, metadata: null });
      try {
        await service.updateReview('user-1', 'lib-1', 'movie', { title: 'Updated' });
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('No review found for this item');
      }
    });
  });

  describe('deleteReview', () => {
    it('deletes a review and emits ReviewDeleted', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: {
          review: {
            title: 'Test',
            body: 'Body',
            spoiler: false,
            visibility: 'PUBLIC',
            createdAt: '2024-01-01T00:00:00.000Z',
            editedAt: null,
          },
        },
      });
      repoMock.updateLibraryItem.mockResolvedValueOnce({ ...mockItem, metadata: {} });
      await service.deleteReview('user-1', 'lib-1', 'movie');
      expect(eventsMock.emitReviewDeleted).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundException when no review exists', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({ ...mockItem, metadata: null });
      try {
        await service.deleteReview('user-1', 'lib-1', 'movie');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as Error).message).toBe('No review found for this item');
      }
    });
  });

  describe('getReview', () => {
    it('returns the review', async () => {
      repoMock.findLibraryItem.mockResolvedValueOnce({
        ...mockItem,
        metadata: {
          review: {
            title: 'Test',
            body: 'Body',
            spoiler: true,
            visibility: 'PUBLIC',
            createdAt: '2024-01-01T00:00:00.000Z',
            editedAt: null,
          },
        },
      });
      const result = await service.getReview('user-1', 'lib-1', 'movie');
      expect(result.title).toBe('Test');
      expect(result.spoiler).toBe(true);
    });
  });

  // ─── List Queries ───────────────────────────────────────────────────────────

  describe('listFavorites', () => {
    it('returns paginated favorites', async () => {
      const result = await service.listFavorites('user-1');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('listBookmarks', () => {
    it('returns paginated bookmarks', async () => {
      const result = await service.listBookmarks('user-1');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('listReviews', () => {
    it('returns paginated reviews', async () => {
      const result = await service.listReviews('user-1');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('listHistory', () => {
    it('returns paginated history', async () => {
      const result = await service.listHistory('user-1');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
