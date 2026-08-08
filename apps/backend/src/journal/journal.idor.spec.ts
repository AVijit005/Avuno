import { describe, it, expect, beforeEach } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { JournalService } from './journal.service';

/**
 * Regression tests for the IDOR in the quote/highlight/memory media lookup.
 *
 * findLibraryMediaId resolved library rows by ID alone, with no userId. That
 * let an authenticated attacker reference another user's library item:
 *  - a 201 vs 404 difference confirmed whether that row existed, and
 *  - the victim's media was bound into the attacker's own quote.
 */

interface QueryRecord {
  delegate: string;
  where: Record<string, unknown>;
}

function createHarness() {
  const queries: QueryRecord[] = [];

  // Two library rows: one owned by the caller, one by somebody else.
  const rows: Record<string, { id: string; userId: string; movieId: string; deletedAt: Date | null }[]> = {
    userMovie: [
      { id: 'lib-mine', userId: 'user-1', movieId: 'movie-1', deletedAt: null },
      { id: 'lib-theirs', userId: 'user-2', movieId: 'movie-2', deletedAt: null },
    ],
  };

  const makeDelegate = (name: string) => ({
    findFirst: ({ where, select }: { where: Record<string, any>; select: Record<string, boolean> }) => {
      queries.push({ delegate: name, where });
      const match = (rows[name] ?? []).find(
        (r) =>
          r.id === where.id &&
          (where.userId === undefined || r.userId === where.userId) &&
          (where.deletedAt === undefined || r.deletedAt === where.deletedAt),
      );
      if (!match) return Promise.resolve(null);
      const projected: Record<string, unknown> = {};
      for (const key of Object.keys(select)) projected[key] = (match as never as Record<string, unknown>)[key];
      return Promise.resolve(projected);
    },
    findMany: ({ where, select }: { where: Record<string, any>; select: Record<string, boolean> }) => {
      queries.push({ delegate: name, where });
      const ids: string[] = where.id?.in ?? [];
      const matches = (rows[name] ?? []).filter(
        (r) =>
          ids.includes(r.id) &&
          (where.userId === undefined || r.userId === where.userId) &&
          (where.deletedAt === undefined || r.deletedAt === where.deletedAt),
      );
      return Promise.resolve(
        matches.map((m) => {
          const projected: Record<string, unknown> = {};
          for (const key of Object.keys(select)) projected[key] = (m as never as Record<string, unknown>)[key];
          return projected;
        }),
      );
    },
  });

  const prismaAny = new Proxy({} as Record<string, unknown>, {
    get: (_t, prop: string) => makeDelegate(prop),
  });

  const attached: { type: string; mediaId: string }[] = [];

  const repoMock = {
    prismaAny: () => prismaAny,
    createQuote: (data: Record<string, unknown>) =>
      Promise.resolve({ id: 'quote-1', createdAt: new Date(), updatedAt: new Date(), ...data }),
    createHighlight: (data: Record<string, unknown>) =>
      Promise.resolve({ id: 'hl-1', createdAt: new Date(), updatedAt: new Date(), ...data }),
    createMemory: () =>
      Promise.resolve({
        id: 'mem-1',
        userId: 'user-1',
        title: 'T',
        content: 'C',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    addMemoryMedia: (_memoryId: string, type: string, mediaId: string) => {
      attached.push({ type, mediaId });
      return Promise.resolve();
    },
  };

  const service = new JournalService(
    repoMock as never,
    {
      emitMemoryCreated: () => Promise.resolve(),
      emitQuoteCreated: () => Promise.resolve(),
      emitHighlightCreated: () => Promise.resolve(),
    } as never,
    {
      createEvent: () => Promise.resolve(),
      fromMemory: () => ({}),
      fromQuote: () => ({}),
      fromHighlight: () => ({}),
      fromJournalEntry: () => ({}),
    } as never,
    {} as never,
    {} as never,
  );

  return { service, queries, attached };
}

describe('Journal media lookup — ownership scoping', () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    harness = createHarness();
  });

  describe('createQuote', () => {
    it("resolves the caller's own library item", async () => {
      const quote = await harness.service.createQuote(
        'user-1',
        'lib-mine',
        { content: 'A line worth keeping' } as never,
        'movie',
      );
      expect(quote).toBeDefined();
    });

    it("refuses another user's library item", async () => {
      await expect(
        harness.service.createQuote('user-1', 'lib-theirs', { content: 'A line worth keeping' } as never, 'movie'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('scopes the lookup query by userId and deletedAt', async () => {
      await harness.service
        .createQuote('user-1', 'lib-mine', { content: 'x' } as never, 'movie')
        .catch(() => undefined);

      const lookup = harness.queries.find((q) => q.delegate === 'userMovie');
      expect(lookup?.where.userId).toBe('user-1');
      expect(lookup?.where.deletedAt).toBeNull();
    });
  });

  describe('createHighlight', () => {
    it("refuses another user's library item", async () => {
      await expect(
        harness.service.createHighlight('user-1', 'lib-theirs', { title: 'A moment' } as never, 'movie'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createMemory', () => {
    it("attaches only the caller's own media", async () => {
      await harness.service.createMemory('user-1', {
        title: 'T',
        content: 'C',
        mediaIds: ['lib-mine', 'lib-theirs'],
      } as never);

      // lib-theirs belongs to user-2 and must be silently skipped.
      expect(harness.attached).toEqual([{ type: 'movie', mediaId: 'movie-1' }]);
    });

    it('batches the lookup instead of querying per id per type', async () => {
      await harness.service.createMemory('user-1', {
        title: 'T',
        content: 'C',
        mediaIds: ['lib-mine', 'lib-theirs'],
      } as never);

      // One query per media type (8), not one per id per type (16).
      expect(harness.queries.length).toBeLessThanOrEqual(8);
      for (const q of harness.queries) {
        expect(q.where.userId).toBe('user-1');
      }
    });
  });
});
