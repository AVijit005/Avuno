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
  limit?: number = 20;
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

export function buildCursorMeta<T>(items: T[], encode: (item: T) => string, limit: number): CursorPaginationMeta<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? encode(items[limit]) : undefined;
  return { data, hasMore, nextCursor };
}
