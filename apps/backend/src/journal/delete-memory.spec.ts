import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { JournalRepository } from './journal.repository';

/**
 * deleteMemory writes to two tables. It previously did so outside any
 * transaction and after a separate ownership read, so a failure between the
 * writes left MemoryMedia rows pointing at a memory that no longer existed.
 *
 * The stub below rolls back on throw, mirroring Postgres, so these tests
 * exercise the abort path rather than just the happy path.
 */
function makeHarness() {
  const state = {
    memories: [
      { id: 'mine', userId: 'user-1' },
      { id: 'theirs', userId: 'user-2' },
    ],
    memoryMedia: [{ memoryId: 'mine' }, { memoryId: 'theirs' }],
  };

  const ops = {
    memory: {
      deleteMany: async ({ where }: { where: { id: string; userId: string } }) => {
        const before = state.memories.length;
        state.memories = state.memories.filter((m) => !(m.id === where.id && m.userId === where.userId));
        return { count: before - state.memories.length };
      },
    },
    memoryMedia: {
      deleteMany: async ({ where }: { where: { memoryId: string } }) => {
        const before = state.memoryMedia.length;
        state.memoryMedia = state.memoryMedia.filter((x) => x.memoryId !== where.memoryId);
        return { count: before - state.memoryMedia.length };
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

  return { repo: new JournalRepository(prisma as never), state };
}

describe('JournalRepository.deleteMemory', () => {
  let harness: ReturnType<typeof makeHarness>;

  beforeEach(() => {
    harness = makeHarness();
  });

  it('deletes the memory and its media together', async () => {
    expect(await harness.repo.deleteMemory('mine', 'user-1')).toBe(true);
    expect(harness.state.memories.map((m) => m.id)).toEqual(['theirs']);
    expect(harness.state.memoryMedia.map((m) => m.memoryId)).toEqual(['theirs']);
  });

  it("refuses another user's memory", async () => {
    expect(await harness.repo.deleteMemory('theirs', 'user-1')).toBe(false);
  });

  it("leaves the other user's media intact when the delete is refused", async () => {
    // The destructive case: deleting children before verifying ownership would
    // strip a victim's MemoryMedia rows even though the delete "failed".
    await harness.repo.deleteMemory('theirs', 'user-1');
    expect(harness.state.memoryMedia).toHaveLength(2);
    expect(harness.state.memories).toHaveLength(2);
  });

  it('returns false for an id that does not exist', async () => {
    expect(await harness.repo.deleteMemory('nope', 'user-1')).toBe(false);
    expect(harness.state.memoryMedia).toHaveLength(2);
  });
});
