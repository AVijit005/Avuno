import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, IsArray } from 'class-validator';
import { JOURNAL_MEDIA_TYPES, type JournalMediaType } from '../journal.media-types';

const MOOD_OPTIONS = [
  'VERY_HAPPY',
  'HAPPY',
  'CALM',
  'NEUTRAL',
  'SAD',
  'VERY_SAD',
  'EXCITED',
  'EMOTIONAL',
  'ANGRY',
  'NOSTALGIC',
] as const;
export type MoodOption = (typeof MOOD_OPTIONS)[number];

const TIMELINE_EVENT_TYPES = [
  'STARTED',
  'COMPLETED',
  'PAUSED',
  'DROPPED',
  'REWATCHED',
  'REREAD',
  'REPLAYED',
  'FAVORITED',
  'RATED',
  'COLLECTION_CREATED',
  'SHELF_CREATED',
  'MEMORY_CREATED',
  'JOURNAL_CREATED',
  'QUOTE_ADDED',
  'HIGHLIGHT_ADDED',
] as const;
export type TimelineEventTypeOption = (typeof TIMELINE_EVENT_TYPES)[number];

// ─── Journal DTOs ──────────────────────────────────────────────────────────────

export class CreateJournalEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MaxLength(50_000)
  content: string;

  @IsOptional()
  @IsIn(MOOD_OPTIONS)
  mood?: MoodOption;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  weather?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  content?: string;

  @IsOptional()
  @IsIn(MOOD_OPTIONS)
  mood?: MoodOption;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  weather?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;
}

export class JournalEntryResponseDto {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  weather: string | null;
  location: string | null;
  isPrivate: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Memory DTOs ───────────────────────────────────────────────────────────────

export class CreateMemoryDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @IsOptional()
  @IsString()
  memoryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emotion?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaIds?: string[];
}

export class UpdateMemoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @IsOptional()
  @IsString()
  memoryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emotion?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

export class MemoryResponseDto {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string | null;
  emotion: string | null;
  isPinned: boolean;
  isPrivate: boolean;
  coverImage: string | null;
  location: string | null;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Timeline DTOs ─────────────────────────────────────────────────────────────

export class CreateTimelineEventDto {
  @IsIn(TIMELINE_EVENT_TYPES)
  type: TimelineEventTypeOption;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  eventDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class TimelineEventResponseDto {
  id: string;
  type: string;
  title: string;
  description: string | null;
  eventDate: string;
  icon: string | null;
  color: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Quote DTOs ────────────────────────────────────────────────────────────────

export class CreateQuoteDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  speaker?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  translation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  speaker?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  translation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class QuoteResponseDto {
  id: string;
  content: string;
  speaker: string | null;
  language: string | null;
  translation: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Highlight DTOs ────────────────────────────────────────────────────────────

export class CreateHighlightDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  timestamp?: number;

  @IsOptional()
  chapter?: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  episode?: number;

  @IsOptional()
  season?: number;

  @IsOptional()
  track?: number;

  @IsOptional()
  lesson?: number;
}

export class UpdateHighlightDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  timestamp?: number;

  @IsOptional()
  chapter?: number;

  @IsOptional()
  page?: number;

  @IsOptional()
  episode?: number;

  @IsOptional()
  season?: number;

  @IsOptional()
  track?: number;

  @IsOptional()
  lesson?: number;
}

export class HighlightResponseDto {
  id: string;
  title: string;
  description: string | null;
  timestamp: number | null;
  chapter: number | null;
  page: number | null;
  episode: number | null;
  season: number | null;
  track: number | null;
  lesson: number | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics DTO ────────────────────────────────────────────────────────────

export class JournalStatisticsDto {
  journalCount: number;
  memoryCount: number;
  writingStreak: number;
  timelineEventCount: number;
  favoriteQuoteCount: number;
  highlightCount: number;
}

/**
 * Validates the `?type=` query param on the quote and highlight endpoints.
 *
 * That value selects a Prisma delegate at runtime, so accepting an arbitrary
 * string was arbitrary delegate access. The allowlist lives with the lookup
 * table it mirrors.
 */
export class MediaTypeQueryDto {
  @IsIn(JOURNAL_MEDIA_TYPES as unknown as string[], {
    message: `type must be one of: ${JOURNAL_MEDIA_TYPES.join(', ')}`,
  })
  type: JournalMediaType;
}
