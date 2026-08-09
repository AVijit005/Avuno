import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The store distinguishes server-backed items (distinct library id and media
 * id) from locally created ones (both ids identical). Only the former can be
 * synced; attempting to PATCH a local-only id would 404.
 */
const snapshot = vi.hoisted(() => ({ items: [] as Array<{ id: string; mediaId: string }> }));

vi.mock("@/lib/store/libraryStore", () => ({
  snapshotAllItems: () => snapshot.items,
  useLibraryStore: { getState: () => ({ meta: { "lib-1": { timesWatched: 3 } } }) },
}));

let resolveServerLibraryId: typeof import("./useLibrarySync").resolveServerLibraryId;

beforeEach(async () => {
  vi.resetModules();
  snapshot.items = [
    { id: "lib-1", mediaId: "movie-1" }, // server-backed
    { id: "u_local_abc", mediaId: "u_local_abc" }, // local-only
  ];
  ({ resolveServerLibraryId } = await import("./useLibrarySync"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveServerLibraryId", () => {
  it("returns the library id for a server-backed item", () => {
    expect(resolveServerLibraryId("lib-1")).toBe("lib-1");
  });

  it("returns null for a locally created item", () => {
    // AddSheet mints `u_<slug>_<ts>` for both ids. There is nothing on the
    // server to PATCH, so the sync layer must skip it rather than 404.
    expect(resolveServerLibraryId("u_local_abc")).toBeNull();
  });

  it("returns null for an unknown id", () => {
    expect(resolveServerLibraryId("does-not-exist")).toBeNull();
  });

  it("returns null when mediaId is absent", () => {
    snapshot.items = [{ id: "lib-2" } as { id: string; mediaId: string }];
    expect(resolveServerLibraryId("lib-2")).toBeNull();
  });
});
