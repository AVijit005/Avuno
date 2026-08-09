import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { CursorPaginationDto, SortDto } from '../../common';

const MEDIA_TYPE_VALUES = [
  'movie',
  'tvShow',
  'tvSeason',
  'tvEpisode',
  'anime',
  'animeEpisode',
  'book',
  'game',
  'musicArtist',
  'musicAlbum',
  'musicTrack',
  'podcast',
  'podcastEpisode',
  'course',
  'courseModule',
  'courseLesson',
] as const;

const CONTENT_STATUS_VALUES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'COMING_SOON'] as const;

export class MediaFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsIn(MEDIA_TYPE_VALUES)
  mediaType?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  releaseYear?: string;

  @IsOptional()
  @IsIn(CONTENT_STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsIn(['title', 'releaseYear', 'releaseDate', 'createdAt', 'updatedAt', 'runtime', 'duration'])
  sortBy?: 'title' | 'releaseYear' | 'releaseDate' | 'createdAt' | 'updatedAt' | 'runtime' | 'duration' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class MediaSortDto extends SortDto {
  @IsOptional()
  @IsIn(['title', 'releaseYear', 'releaseDate', 'createdAt', 'updatedAt', 'runtime', 'duration'])
  sortBy: 'title' | 'releaseYear' | 'releaseDate' | 'createdAt' | 'updatedAt' | 'runtime' | 'duration' = 'createdAt';
}

export class MediaSearchDto extends CursorPaginationDto {
  @IsString()
  search!: string;

  @IsOptional()
  @IsIn(MEDIA_TYPE_VALUES)
  mediaType?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  releaseYear?: string;

  @IsOptional()
  @IsIn(CONTENT_STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsIn(['title', 'releaseYear', 'releaseDate', 'createdAt', 'updatedAt', 'runtime', 'duration'])
  sortBy?: 'title' | 'releaseYear' | 'releaseDate' | 'createdAt' | 'updatedAt' | 'runtime' | 'duration';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class IdParamDto {
  @IsUUID()
  id!: string;
}

export class TypeParamDto {
  @IsIn(MEDIA_TYPE_VALUES)
  type!: string;
}
