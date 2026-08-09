import 'reflect-metadata';
import { describe, it, expect } from 'bun:test';
import { buildCursorMeta } from './cursor-pagination';

interface Row {
  id: string;
}

/**
 * Walks a dataset the way a real client does, mirroring the repository
 * semantics: callers over-fetch `limit + 1` rows, and `cursor` is always
 * paired with `skip: 1` ("resume after this row").
 *
 * Returns every id the client actually received.
 */
function paginate(all: Row[], limit: number): string[] {
  const seen: string[] = [];
  let cursor: string | undefined;

  for (let guard = 0; guard < 100; guard++) {
    const start = cursor ? all.findIndex((r) => r.id === cursor) + 1 : 0;
    const items = all.slice(start, start + limit + 1);
    const meta = buildCursorMeta(items, (i) => i.id, limit);
    seen.push(...meta.data.map((d) => d.id));
    if (!meta.hasMore) return seen;
    cursor = meta.nextCursor;
  }

  throw new Error('pagination did not terminate');
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: `r${i}` }));

describe('buildCursorMeta', () => {
  it('trims the over-fetched row from the page', () => {
    const meta = buildCursorMeta(rows(4), (i) => i.id, 3);
    expect(meta.data).toHaveLength(3);
    expect(meta.hasMore).toBe(true);
  });

  it('points the cursor at the LAST row of the current page', () => {
    // Not the first row of the next page: repositories pair the cursor with
    // skip: 1, so it must identify the last row already seen.
    const meta = buildCursorMeta(rows(4), (i) => i.id, 3);
    expect(meta.nextCursor).toBe('r2');
  });

  it('reports no more pages when the result fits exactly', () => {
    const meta = buildCursorMeta(rows(3), (i) => i.id, 3);
    expect(meta.data).toHaveLength(3);
    expect(meta.hasMore).toBe(false);
    expect(meta.nextCursor).toBeUndefined();
  });

  it('handles an empty result', () => {
    const meta = buildCursorMeta([], (i: Row) => i.id, 3);
    expect(meta.data).toEqual([]);
    expect(meta.hasMore).toBe(false);
    expect(meta.nextCursor).toBeUndefined();
  });

  describe('full traversal returns every row', () => {
    // The regression: encoding items[limit] dropped exactly one record at each
    // page boundary, so 10 rows at a page size of 3 returned only 8.
    it.each([
      [10, 3],
      [10, 1],
      [7, 7],
      [8, 3],
      [9, 3],
      [1, 3],
      [100, 20],
    ])('%i rows at page size %i', (total, limit) => {
      const all = rows(total);
      const seen = paginate(all, limit);
      expect(seen).toEqual(all.map((r) => r.id));
    });
  });

  it('never yields a duplicate across pages', () => {
    const seen = paginate(rows(25), 4);
    expect(new Set(seen).size).toBe(seen.length);
  });
});
