import { describe, it, expect } from "vitest";
import { nextPageParam, type ItemsPage } from "./pagination";

/**
 * These endpoints return the last row's timestamp as `cursor` even on the
 * final page, so `hasMore` is the only reliable stop signal. Trusting the
 * cursor alone would page forever.
 */
function page<T>(items: T[], hasMore: boolean, cursor: string | null): ItemsPage<T> {
  return { items, hasMore, cursor };
}

describe("nextPageParam", () => {
  it("returns the cursor when more pages exist", () => {
    expect(nextPageParam(page([1, 2], true, "2025-01-01T00:00:00Z"))).toBe("2025-01-01T00:00:00Z");
  });

  it("stops on the last page even though a cursor is present", () => {
    // The regression this guards: these services always emit a cursor.
    expect(nextPageParam(page([1, 2], false, "2025-01-01T00:00:00Z"))).toBeUndefined();
  });

  it("stops when there is no cursor", () => {
    expect(nextPageParam(page([], true, null))).toBeUndefined();
  });

  it("stops on an empty final page", () => {
    expect(nextPageParam(page([], false, null))).toBeUndefined();
  });

  it("terminates when walked to exhaustion", () => {
    const all = Array.from({ length: 10 }, (_, i) => i);
    const size = 3;
    const seen: number[] = [];
    let cursor: string | undefined;

    for (let guard = 0; guard < 50; guard++) {
      const start = cursor ? Number(cursor) : 0;
      const slice = all.slice(start, start + size);
      const hasMore = start + size < all.length;
      // Mirrors the backend: a cursor is emitted even on the final page.
      const p = page(slice, hasMore, String(start + size));
      seen.push(...p.items);
      const next = nextPageParam(p);
      if (!next) break;
      cursor = next;
    }

    expect(seen).toEqual(all);
  });
});
