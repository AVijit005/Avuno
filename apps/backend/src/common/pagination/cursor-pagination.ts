import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export interface CursorPaginationMeta<T> {
  nextCursor?: string;
  hasMore: boolean;
  data: T[];
}

export interface CursorEncoder<T> {
  encode(cursor: T): string;
  decode(cursor: string): T;
}

/**
 * Build the pagination envelope from an over-fetched result set.
 *
 * Callers request `limit + 1` rows; the extra row is how we know whether more
 * data exists. It is trimmed from `data` and never returned to the client.
 *
 * The cursor is the LAST item of the current page. Every repository pairs
 * `cursor` with `skip: 1`, which means "resume after this row" — so the cursor
 * must identify the final row the caller has already seen.
 *
 * This previously encoded `items[limit]`, the first row of the NEXT page.
 * Combined with `skip: 1` that row was then skipped over, so exactly one
 * record was silently dropped at every page boundary: paginating 10 rows at a
 * page size of 3 returned only 8.
 */
export function buildCursorMeta<T>(items: T[], encode: (item: T) => string, limit: number): CursorPaginationMeta<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const last = data[data.length - 1];
  const nextCursor = hasMore && last !== undefined ? encode(last) : undefined;
  return { data, hasMore, nextCursor };
}
