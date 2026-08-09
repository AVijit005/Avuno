import 'reflect-metadata';
import { describe, it, expect } from 'bun:test';
import { DiscoveryService } from './discovery.service';
import type { AnalyticsRepository } from './analytics.repository';

function libRow(type: string, id: string, title: string, rating: number | null, genres: string[]) {
  return {
    id: `lib-${id}`,
    status: 'COMPLETED',
    rating,
    _mediaType: type,
    [type]: { id, title, slug: title.toLowerCase(), posterUrl: null, releaseYear: 2020, genres },
  };
}

function populatedRepo() {
  return {
    getInProgressByType: async () => [libRow('movie', 'm1', 'Dune', null, ['Sci-Fi'])],
    getRecentlyCompleted: async () => [
      libRow('movie', 'm2', 'Arrival', 5, ['Sci-Fi', 'Drama']),
      libRow('book', 'b1', 'Dubliners', 3, ['Literary']),
    ],
    getRecentlyAdded: async () => [libRow('movie', 'm3', 'Sicario', null, ['Thriller'])],
    getGenreData: async () => ({ genreCounts: { 'Sci-Fi': 7, Drama: 4, Literary: 2 } }),
    countCompletedByType: async () => ({ movie: 6, book: 2 }),
    countByStatus: async () => ({ WATCHING: 3, COMPLETED: 8 }),
    getTotalLibraryItems: async () => 14,
    getAverageRating: async () => 4.25,
    getActivityData: async () => ({ '2025-01-04': 2, '2025-06-10': 3, '2026-02-01': 1 }),
  } as unknown as AnalyticsRepository;
}

function emptyRepo() {
  return {
    getInProgressByType: async () => [],
    getRecentlyCompleted: async () => [],
    getRecentlyAdded: async () => [],
    getGenreData: async () => ({ genreCounts: {} }),
    countCompletedByType: async () => ({}),
    countByStatus: async () => ({}),
    getTotalLibraryItems: async () => 0,
    getAverageRating: async () => null,
    getActivityData: async () => ({}),
  } as unknown as AnalyticsRepository;
}

describe('DiscoveryService', () => {
  describe('with a populated library', () => {
    const svc = new DiscoveryService(populatedRepo());

    it('recommends something the user has not started', async () => {
      const d = await svc.getDiscovery('u1');
      expect(d.recommendedToday?.mediaTitle).toBe('Dune');
    });

    it('treats highly rated completions as hidden gems', async () => {
      const d = await svc.getDiscovery('u1');
      expect(d.hiddenGems.map((h) => h.mediaTitle)).toEqual(['Arrival']);
    });

    it('ranks genre expansion by real counts', async () => {
      const d = await svc.getDiscovery('u1');
      expect(d.genreExpansion.map((g) => g.genre)).toEqual(['Sci-Fi', 'Drama', 'Literary']);
    });

    it('derives the taste profile from genre counts', async () => {
      const i = await svc.getIntelligence('u1');
      expect(i.tasteProfile.favoriteGenres[0]).toEqual({ name: 'Sci-Fi', count: 7 });
    });

    it('attaches evidence to every personal statement', async () => {
      const i = await svc.getIntelligence('u1');
      expect(i.personalStatements.length).toBeGreaterThan(0);
      for (const s of i.personalStatements) {
        expect(s.evidence.length).toBeGreaterThan(0);
      }
    });

    it('groups media evolution by year', async () => {
      const i = await svc.getIntelligence('u1');
      expect(i.mediaEvolution).toEqual([
        { year: '2025', focus: 'Sci-Fi', mediaCount: 5, hoursSpent: 0, topGenre: 'Sci-Fi', journalCount: 0 },
        { year: '2026', focus: 'Sci-Fi', mediaCount: 1, hoursSpent: 0, topGenre: 'Sci-Fi', journalCount: 0 },
      ]);
    });

    it('sets a challenge target above current progress', async () => {
      const c = await svc.getChallenges('u1');
      const completion = c.challenges.find((x) => x.id === 'complete-milestone');
      expect(completion?.current).toBe(8);
      expect(completion?.target).toBe(10);
    });

    it('returns genre distribution for the constellation', async () => {
      const k = await svc.getConstellation('u1');
      expect(k.map((x) => x.label)).toEqual(['Sci-Fi', 'Drama', 'Literary']);
      expect(k[0].count).toBe(7);
    });
  });

  describe('with an empty library', () => {
    const svc = new DiscoveryService(emptyRepo());

    // The point of this suite: a new user must see nothing rather than
    // invented content. Fabricated "insights" are exactly what this phase
    // removes from the frontend, so the backend must not reintroduce them.
    it('recommends nothing', async () => {
      const d = await svc.getDiscovery('u1');
      expect(d.recommendedToday).toBeNull();
      expect(d.continueMood).toEqual([]);
      expect(d.hiddenGems).toEqual([]);
      expect(d.trendingInLibrary).toEqual([]);
    });

    it('makes no personal statements', async () => {
      const i = await svc.getIntelligence('u1');
      expect(i.personalStatements).toEqual([]);
      expect(i.editorialInsight).toBe('');
    });

    it('emits no constellation points', async () => {
      expect(await svc.getConstellation('u1')).toEqual([]);
    });
  });

  describe('resilience', () => {
    it('degrades to empty when the repository throws', async () => {
      const failing = {
        getInProgressByType: async () => {
          throw new Error('db down');
        },
        getRecentlyCompleted: async () => {
          throw new Error('db down');
        },
        getRecentlyAdded: async () => {
          throw new Error('db down');
        },
        getGenreData: async () => {
          throw new Error('db down');
        },
      } as unknown as AnalyticsRepository;

      const d = await new DiscoveryService(failing).getDiscovery('u1');
      expect(d.recommendedToday).toBeNull();
      expect(d.genreExpansion).toEqual([]);
    });

    it('skips rows whose catalog record is missing', async () => {
      const orphaned = {
        ...populatedRepo(),
        getRecentlyCompleted: async () => [{ id: 'lib-x', _mediaType: 'movie', rating: 5 }],
      } as unknown as AnalyticsRepository;

      // A library row with no joined media has no title or poster; rendering
      // it would produce an "Unknown" card.
      const d = await new DiscoveryService(orphaned).getDiscovery('u1');
      expect(d.hiddenGems).toEqual([]);
    });
  });
});
