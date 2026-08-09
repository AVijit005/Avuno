import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { WrappedRepository } from './wrapped.repository';

/**
 * deleteWrappedYear removes a year and its stats.
 *
 * The subtle failure mode this guards: using the ARRAY form of $transaction
 * would commit even when the year delete matched zero rows, because a zero-row
 * delete is not an error — so passing another user's id would destroy their
 * stats while their year row survived. Ownership must be verified first, and
 * the transaction must abort.
 */
function makeHarness() {
  const state = {
    years: [
      { id: 'mine', userId: 'user-1' },
      { id: 'theirs', userId: 'user-2' },
    ],
    stats: [{ wrappedYearId: 'mine' }, { wrappedYearId: 'theirs' }],
  };

  const ops = {
    wrappedYear: {
      deleteMany: async ({ where }: { where: { id: string; userId: string } }) => {
        const before = state.years.length;
        state.years = state.years.filter((y) => !(y.id === where.id && y.userId === where.userId));
        return { count: before - state.years.length };
      },
    },
    wrappedStat: {
      deleteMany: async ({ where }: { where: { wrappedYearId: string } }) => {
        const before = state.stats.length;
        state.stats = state.stats.filter((s) => s.wrappedYearId !== where.wrappedYearId);
        return { count: before - state.stats.length };
      },
    },
  };

  const prisma = {
    ...ops,
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      const snapshot = JSON.parse(JSON.stringify(state));
      try {
        return await fn(ops);
      } catch (error) {
        Object.assign(state, snapshot);
        throw error;
      }
    },
  };

  return { repo: new WrappedRepository(prisma as never), state };
}

describe('WrappedRepository.deleteWrappedYear', () => {
  let harness: ReturnType<typeof makeHarness>;

  beforeEach(() => {
    harness = makeHarness();
  });

  it('deletes the year and its stats together', async () => {
    expect(await harness.repo.deleteWrappedYear('mine', 'user-1')).toBe(true);
    expect(harness.state.years.map((y) => y.id)).toEqual(['theirs']);
    expect(harness.state.stats.map((s) => s.wrappedYearId)).toEqual(['theirs']);
  });

  it("refuses another user's year", async () => {
    expect(await harness.repo.deleteWrappedYear('theirs', 'user-1')).toBe(false);
  });

  it("does not destroy another user's stats when refused", async () => {
    await harness.repo.deleteWrappedYear('theirs', 'user-1');
    expect(harness.state.stats).toHaveLength(2);
    expect(harness.state.years).toHaveLength(2);
  });

  it('returns false for an id that does not exist', async () => {
    expect(await harness.repo.deleteWrappedYear('nope', 'user-1')).toBe(false);
    expect(harness.state.stats).toHaveLength(2);
  });
});
