import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { InteractionRepository } from './interaction.repository';

describe('InteractionRepository', () => {
  let repo: InteractionRepository;
  let prismaMock: Record<string, any>;

  const mockDelegate = {
    findUnique: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve(null)),
    count: mock(() => Promise.resolve(0)),
  };

  beforeEach(() => {
    prismaMock = {
      userMovie: { ...mockDelegate },
      userTvShow: { ...mockDelegate },
      userAnime: { ...mockDelegate },
      userBook: { ...mockDelegate },
      userGame: { ...mockDelegate },
      userMusicAlbum: { ...mockDelegate },
      userPodcast: { ...mockDelegate },
      userCourse: { ...mockDelegate },
      movie: { ...mockDelegate },
      tvShow: { ...mockDelegate },
      anime: { ...mockDelegate },
      book: { ...mockDelegate },
      game: { ...mockDelegate },
      musicAlbum: { ...mockDelegate },
      podcast: { ...mockDelegate },
      course: { ...mockDelegate },
      activityFeed: { ...mockDelegate },
    };
    repo = new InteractionRepository(prismaMock as any);
  });

  // ─── findLibraryItem ────────────────────────────────────────────────────────

  describe('findLibraryItem', () => {
    it('returns null for unknown type', async () => {
      const result = await repo.findLibraryItem('id', 'unknown');
      expect(result).toBeNull();
    });

    it('returns null when delegate missing', async () => {
      prismaMock.userMovie = undefined;
      const result = await repo.findLibraryItem('id', 'movie');
      expect(result).toBeNull();
    });

    it('returns item when found by movie type', async () => {
      const mockRow = { id: 'lib-1', userId: 'user-1', movieId: 'movie-1', favorite: true };
      prismaMock.userMovie.findUnique.mockResolvedValueOnce(mockRow);
      prismaMock.movie.findUnique ||= mock(() =>
        Promise.resolve({ id: 'movie-1', slug: 'test', title: 'Test', posterUrl: null }),
      );
      const result = await repo.findLibraryItem('lib-1', 'movie');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('lib-1');
    });
  });

  // ─── updateLibraryItem ──────────────────────────────────────────────────────

  describe('updateLibraryItem', () => {
    it('returns null for unknown type', async () => {
      const result = await repo.updateLibraryItem('id', 'unknown', 'user-1', { rating: 5 });
      expect(result).toBeNull();
    });

    it('returns null when item not found', async () => {
      prismaMock.userMovie.findUnique.mockResolvedValueOnce(null);
      const result = await repo.updateLibraryItem('id', 'movie', 'user-1', { rating: 5 });
      expect(result).toBeNull();
    });

    it('returns null when userId does not match', async () => {
      prismaMock.userMovie.findUnique.mockResolvedValueOnce({ id: 'lib-1', userId: 'other-user' });
      const result = await repo.updateLibraryItem('lib-1', 'movie', 'user-1', { rating: 5 });
      expect(result).toBeNull();
    });

    it('updates the item when found and owned', async () => {
      const existing = { id: 'lib-1', userId: 'user-1' };
      const updated = { id: 'lib-1', userId: 'user-1', rating: 5 };
      prismaMock.userMovie.findUnique.mockResolvedValueOnce(existing);
      prismaMock.userMovie.update.mockResolvedValueOnce(updated);
      const result = await repo.updateLibraryItem('lib-1', 'movie', 'user-1', { rating: 5 });
      expect(result).not.toBeNull();
      expect(result!.rating).toBe(5);
    });
  });

  // ─── recordHistory ──────────────────────────────────────────────────────────

  describe('recordHistory', () => {
    it('creates an activity feed entry', async () => {
      prismaMock.activityFeed.create.mockResolvedValueOnce({ id: 'feed-1' });
      await repo.recordHistory('user-1', 'RATED', 'lib-1', 'movie', { rating: 5 });
      expect(prismaMock.activityFeed.create).toHaveBeenCalledTimes(1);
    });

    it('does not throw when activityFeed delegate is missing', async () => {
      delete prismaMock.activityFeed;
      await repo.recordHistory('user-1', 'RATED', 'lib-1', 'movie');
      // no error
    });
  });

  // ─── List Queries ───────────────────────────────────────────────────────────

  describe('findFavorites', () => {
    it('returns empty array when no favorites', async () => {
      const result = await repo.findFavorites('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('findBookmarks', () => {
    it('returns empty array when no bookmarks', async () => {
      const result = await repo.findBookmarks('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('findWithReviews', () => {
    it('returns empty array when no reviews', async () => {
      const result = await repo.findWithReviews('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('findHistory', () => {
    it('returns empty array when no history', async () => {
      const result = await repo.findHistory('user-1');
      expect(result).toEqual([]);
    });

    it('returns empty array when activityFeed delegate missing', async () => {
      delete prismaMock.activityFeed;
      const result = await repo.findHistory('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('findHistoryByLibraryItem', () => {
    it('returns empty array when no history', async () => {
      const result = await repo.findHistoryByLibraryItem('user-1', 'lib-1', 'movie');
      expect(result).toEqual([]);
    });
  });
});
