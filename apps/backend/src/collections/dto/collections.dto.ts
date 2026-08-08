import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const VISIBILITY_OPTIONS = ['PRIVATE', 'PUBLIC', 'UNLISTED', 'FOLLOWERS_ONLY'] as const;
export type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];

const SMART_RULE_OPERATORS = ['equals', 'not_equals', 'gte', 'lte', 'gt', 'lt', 'contains'] as const;
export type SmartRuleOperator = (typeof SMART_RULE_OPERATORS)[number];

const SMART_RULE_FIELDS = ['status', 'rating', 'favorite', 'mediaType', 'hidden', 'hasReview'] as const;
export type SmartRuleField = (typeof SMART_RULE_FIELDS)[number];

export class SmartCollectionRuleDto {
  @IsIn(SMART_RULE_FIELDS)
  field: SmartRuleField;

  @IsIn(SMART_RULE_OPERATORS)
  operator: SmartRuleOperator;

  value: unknown;
}

export class SmartCollectionConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SmartCollectionRuleDto)
  rules: SmartCollectionRuleDto[];

  @IsOptional()
  @IsString()
  matchMode?: 'ALL' | 'ANY';
}

// ─── Collection DTOs ────────────────────────────────────────────────────────────

export class CreateCollectionDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(VISIBILITY_OPTIONS)
  visibility?: VisibilityOption;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isSmartCollection?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmartCollectionConfigDto)
  smartRules?: SmartCollectionConfigDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(VISIBILITY_OPTIONS)
  visibility?: VisibilityOption;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SmartCollectionConfigDto)
  smartRules?: SmartCollectionConfigDto;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class AddCollectionItemDto {
  @IsString()
  mediaId: string;

  @IsString()
  mediaType: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ReorderItemsDto {
  /**
   * IDs must be UUIDs and the list is capped: it was previously an unbounded
   * array of arbitrary strings, so a single request could open a transaction
   * containing tens of thousands of writes.
   */
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  itemIds: string[];
}

// ─── Shelf DTOs ─────────────────────────────────────────────────────────────────

export class CreateShelfDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(VISIBILITY_OPTIONS)
  visibility?: VisibilityOption;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateShelfDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(VISIBILITY_OPTIONS)
  visibility?: VisibilityOption;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────────

export class CollectionItemResponseDto {
  id: string;
  position: number;
  note: string | null;
  addedAt: string;
  mediaId: string;
  mediaType: string;
  title: string;
  slug: string;
  posterUrl: string | null;
}

export class CollectionResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  sortOrder: number;
  isPinned: boolean;
  isSmartCollection: boolean;
  icon: string | null;
  color: string | null;
  itemCount: number;
  stats?: CollectionStatsDto | null;
  items?: CollectionItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export class ShelfResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: string;
  sortOrder: number;
  isPinned: boolean;
  icon: string | null;
  color: string | null;
  items?: CollectionItemResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export class CollectionStatsDto {
  totalItems: number;
  completed: number;
  favoriteCount: number;
  completionPercent: number;
  mediaTypeBreakdown: Record<string, number>;
}

export class CollectionListResponseDto {
  items: CollectionResponseDto[];
  total: number;
}
