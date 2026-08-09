/**
 * Wire shapes for paginated endpoints.
 *
 * The backend uses two different envelopes, and the frontend previously
 * declared a third that matched neither — so pagination silently stopped after
 * the first page and one list crashed on render. These types exist so the
 * mismatch cannot recur silently: each client must pick the envelope its
 * endpoint actually returns.
 *
 * Both are real; neither is wrong. They differ because they paginate
 * differently:
 *
 *  - `CursorPage` (library, media): id-based cursor with Prisma `skip: 1`,
 *    produced by the backend's shared buildCursorMeta helper.
 *  - `ItemsPage` (journal, memories, timeline, quotes, highlights,
 *    interaction): timestamp-based cursor using a `lt` filter, hand-rolled in
 *    those services.
 */

/** `{ data, hasMore, nextCursor }` — id cursor, from buildCursorMeta. */
export interface CursorPage<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

/** `{ items, hasMore, cursor }` — timestamp cursor. */
export interface ItemsPage<T> {
  items: T[];
  hasMore: boolean;
  cursor: string | null;
}

/** Total is included by the interaction endpoints. */
export interface CountedItemsPage<T> extends ItemsPage<T> {
  total: number;
}

/**
 * Cursor for the next page, or undefined when there is none.
 *
 * Guards on `hasMore` as well as the cursor itself: these endpoints return the
 * last row's timestamp even on the final page, so trusting the cursor alone
 * would loop forever.
 */
export function nextPageParam<T>(page: ItemsPage<T>): string | undefined {
  return page.hasMore && page.cursor ? page.cursor : undefined;
}
