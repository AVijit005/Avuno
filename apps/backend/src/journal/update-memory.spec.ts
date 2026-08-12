import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { JournalRepository } from './journal.repository';

function makeHarness() {
  const state = {
    memories: [
      { id: 'mine', userId: 'user-1', title: 'Original' },
      { id: 'theirs', userId: 'user-2', title: 'Theirs' },
    ],
  };

  const prisma = {
    memory: {
      updateMany: async ({ where, data }: { where: { id: string; userId: string }; data: any }) => {
        const matches = state.memories.filter((m) => m.id === where.id && m.userId === where.userId);
        for (const m of matches) {
          Object.assign(m, data);
        }
        return { count: matches.length };
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        return state.memories.find((m) => m.id === where.id) || null;
      },
    },
  };

  return { repo: new JournalRepository(prisma as never), state };
}

describe('JournalRepository.updateMemory', () => {
  let harness: ReturnType<typeof makeHarness>;

  beforeEach(() => {
    harness = makeHarness();
  });

  it('updates own memory successfully', async () => {
    const result = await harness.repo.updateMemory('mine', 'user-1', { title: 'Updated' });
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Updated');
    expect(harness.state.memories.find((m) => m.id === 'mine')?.title).toBe('Updated');
  });

  it('rejects update of foreign user memory', async () => {
    const result = await harness.repo.updateMemory('theirs', 'user-1', { title: 'Hacked' });
    expect(result).toBeNull();
    expect(harness.state.memories.find((m) => m.id === 'theirs')?.title).toBe('Theirs');
  });

  it('returns null for an id that does not exist', async () => {
    const result = await harness.repo.updateMemory('nope', 'user-1', { title: 'Nothing' });
    expect(result).toBeNull();
  });
});
