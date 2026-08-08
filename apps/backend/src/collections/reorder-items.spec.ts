import { describe, it, expect, beforeEach } from 'bun:test';
import { CollectionsRepository } from './collections.repository';

/**
 * Regression tests for the IDOR in CollectionsRepository.reorderItems.
 *
 * Ownership was verified on the collection but the writes ran with
 * `where: { id: itemId }` and no collectionId, so any authenticated user could
 * rewrite `position` on arbitrary CollectionItem rows — including other users'
 * — by listing their IDs, scrambling someone else's curated ordering.
 */

interface ItemRow {
  id: string;
  collectionId: string;
  position: number;
}

function createRepository(items: ItemRow[]) {
  const collections = [
    { id: 'col-mine', userId: 'user-1' },
    { id: 'col-theirs', userId: 'user-2' },
  ];

  const txAny = {
    collectionItem: {
      findMany: ({ where }: { where: Record<string, any> }) => {
        const ids: string[] = where.id?.in ?? [];
        return Promise.resolve(
          items.filter((i) => ids.includes(i.id) && i.collectionId === where.collectionId).map((i) => ({ id: i.id })),
        );
      },
      update: ({ where, data }: { where: { id: string }; data: { position: number } }) => {
        const row = items.find((i) => i.id === where.id);
        if (!row) return Promise.reject(new Error('P2025'));
        row.position = data.position;
        return Promise.resolve(row);
      },
    },
  };

  const prismaAny = {
    collection: {
      findUnique: ({ where }: { where: { id: string } }) =>
        Promise.resolve(collections.find((c) => c.id === where.id) ?? null),
    },
  };

  const repo = new CollectionsRepository({
    $transaction: (fn: (tx: unknown) => unknown) => Promise.resolve(fn(txAny)),
  } as never);

  // prismaAny() is the private dynamic-delegate accessor.
  (repo as unknown as { prismaAny: () => unknown }).prismaAny = () => prismaAny;

  return { repo, items };
}

describe('CollectionsRepository.reorderItems', () => {
  let items: ItemRow[];
  let repo: CollectionsRepository;

  beforeEach(() => {
    items = [
      { id: 'item-a', collectionId: 'col-mine', position: 0 },
      { id: 'item-b', collectionId: 'col-mine', position: 1 },
      { id: 'victim-item', collectionId: 'col-theirs', position: 0 },
    ];
    ({ repo } = createRepository(items));
  });

  it('reorders items the caller owns', async () => {
    const ok = await repo.reorderItems('col-mine', 'user-1', ['item-b', 'item-a']);
    expect(ok).toBe(true);
    expect(items.find((i) => i.id === 'item-b')!.position).toBe(0);
    expect(items.find((i) => i.id === 'item-a')!.position).toBe(1);
  });

  it('refuses a collection the caller does not own', async () => {
    const ok = await repo.reorderItems('col-theirs', 'user-1', ['victim-item']);
    expect(ok).toBe(false);
    expect(items.find((i) => i.id === 'victim-item')!.position).toBe(0);
  });

  it("refuses IDs belonging to another user's collection", async () => {
    // The attack: own col-mine, but pass a foreign item ID.
    const ok = await repo.reorderItems('col-mine', 'user-1', ['item-a', 'victim-item']);
    expect(ok).toBe(false);
  });

  it('does not partially apply a batch containing a foreign ID', async () => {
    await repo.reorderItems('col-mine', 'user-1', ['victim-item', 'item-a']);

    // Membership is checked before any write, so nothing moved.
    expect(items.find((i) => i.id === 'victim-item')!.position).toBe(0);
    expect(items.find((i) => i.id === 'item-a')!.position).toBe(0);
  });

  it('refuses IDs that do not exist at all', async () => {
    const ok = await repo.reorderItems('col-mine', 'user-1', ['item-a', 'does-not-exist']);
    expect(ok).toBe(false);
  });
});
