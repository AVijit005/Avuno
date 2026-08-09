import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { SearchRepository } from './search.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchRepository', () => {
  let repository: SearchRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      movie: {
        findMany: mock(async () => [
          {
            id: 'movie-1',
            title: 'Matrix',
            slug: 'matrix',
            posterUrl: 'poster.jpg',
            releaseYear: 1999,
            overview: 'Hackers and agents',
          },
        ]),
      },
      tvShow: {
        findMany: mock(async () => []),
      },
      userLibraryItem: {
        findMany: mock(async () => [
          {
            id: 'lib-1',
            status: 'COMPLETED',
            notes: 'Great movie',
            createdAt: new Date(),
            updatedAt: new Date(),
            movie: {
              id: 'movie-1',
              title: 'Matrix',
              slug: 'matrix',
              posterUrl: 'poster.jpg',
              releaseYear: 1999,
            },
          },
        ]),
      },
      userMovie: {
        findMany: mock(async () => [
          {
            id: 'lib-1',
            status: 'COMPLETED',
            movie: {
              id: 'movie-1',
              title: 'Matrix',
              slug: 'matrix',
              posterUrl: 'poster.jpg',
              releaseYear: 1999,
            },
          },
        ]),
      },
      user: {
        findMany: mock(async () => [
          {
            id: 'user-2',
            name: 'Neo',
            username: 'neo_one',
            avatar: 'neo.jpg',
          },
        ]),
      },
    };

    repository = new SearchRepository(mockPrisma as PrismaService);
  });

  describe('searchMedia', () => {
    it('returns search results matching the query', async () => {
      const results = await repository.searchMedia('matrix');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Matrix');
      expect(results[0].type).toBe('movie');
      expect(results[0].subtitle).toBe('1999');
    });

    it('filters by type if provided', async () => {
      const results = await repository.searchMedia('matrix', 'tvShow');
      expect(results.length).toBe(0);
    });
  });

  describe('searchLibrary', () => {
    it('returns search results from user library', async () => {
      const results = await repository.searchLibrary('user-1', 'matrix', 'movie');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('Matrix');
      expect(results[0].type).toBe('movie');
    });
  });
});
