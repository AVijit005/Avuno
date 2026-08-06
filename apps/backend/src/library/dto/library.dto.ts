import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { CursorPaginationDto, SortDto } from '../../common';
import { Transform } from 'class-transformer';

const MEDIA_TYPE_VALUES = ['movie', 'tvShow', 'anime', 'book', 'game', 'musicAlbum', 'podcast', 'course'] as const;

const STATUS_VALUES = [
  'PLANNING',
  'WATCHING',
  'REWATCHING',
  'READING',
  'PLAYING',
  'LISTENING',
  'LEARNING',
  'PAUSED',
  'COMPLETED',
  'DROPPED',
  'ON_HOLD',
  'ARCHIVED',
] as const;

export class AddToLibraryDto {
  @IsIn(MEDIA_TYPE_VALUES)
  mediaType!: string;

  @IsUUID()
  mediaId!: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: string;
}

export class UpdateLibraryItemDto {
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsBoolean()
  private?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsString()
  finishedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  progress?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewatchCount?: number;
}

export class LibraryFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsIn(MEDIA_TYPE_VALUES)
  mediaType?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  private?: boolean;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'status', 'rating', 'lastInteractionAt', 'progress'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

export class LibrarySortDto extends SortDto {
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'status', 'rating', 'lastInteractionAt', 'progress'])
  sortBy: string = 'createdAt';
}

export class LibraryItemResponseDto {
  id: string;
  status: string;
  rating: number | null;
  rewatchCount: number | null;
  favorite: boolean;
  hidden: boolean;
  private: boolean;
  notes: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  lastInteractionAt: string | null;
  progress: number | null;
  progressPercentage: number | null;
  createdAt: string;
  updatedAt: string;
  mediaType: string;
  media: {
    id: string;
    slug: string;
    title: string;
    posterUrl: string | null;
    backdropUrl: string | null;
    releaseYear: number | null;
    genres: string[];
  } | null;
}

export class IdParamDto {
  @IsUUID()
  id!: string;
}

export class TypeParamDto {
  @IsIn(MEDIA_TYPE_VALUES)
  type!: string;
}

export class StatusParamDto {
  @IsIn(STATUS_VALUES)
  status!: string;
}
