/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { JournalRepository } from './journal.repository';
import { JournalEventService } from './journal-event.service';
import { TimelineEventFactory } from './timeline-event-factory';
import { JournalStatisticsService } from './journal-statistics.service';
import { PromptService } from './prompt.service';
export { JOURNAL_MEDIA_TYPES, type JournalMediaType } from './journal.media-types';
import type {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  JournalEntryResponseDto,
  CreateMemoryDto,
  UpdateMemoryDto,
  MemoryResponseDto,
  CreateTimelineEventDto,
  TimelineEventResponseDto,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteResponseDto,
  CreateHighlightDto,
  UpdateHighlightDto,
  HighlightResponseDto,
  JournalStatisticsDto,
} from './dto';

@Injectable()
export class JournalService {
  constructor(
    private readonly repository: JournalRepository,
    private readonly events: JournalEventService,
    private readonly timelineFactory: TimelineEventFactory,
    private readonly statsService: JournalStatisticsService,
    private readonly promptService: PromptService,
  ) {}

  // ─── Journal Entries ──────────────────────────────────────────────────────

  async createEntry(userId: string, dto: CreateJournalEntryDto): Promise<JournalEntryResponseDto> {
    const entry = await this.repository.createEntry({
      userId,
      title: dto.title,
      content: dto.content,
      mood: dto.mood,
      weather: dto.weather,
      location: dto.location,
      isPrivate: dto.isPrivate,
      coverImage: dto.coverImage,
    });

    await this.events.emitJournalCreated(userId, entry.id);

    // Auto-generate timeline event
    await this.timelineFactory.createEvent(
      userId,
      this.timelineFactory.fromJournalEntry(userId, entry.id, dto.title ?? ''),
    );

    return this.toEntryResponse(entry);
  }

  async findEntries(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: JournalEntryResponseDto[]; hasMore: boolean; cursor: string | null }> {
    const items = await this.repository.findEntriesByUserId(userId, limit, cursor);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    return {
      items: sliced.map((e: any) => this.toEntryResponse(e)),
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].createdAt.toISOString() : null,
    };
  }

  async findEntry(id: string, userId: string): Promise<JournalEntryResponseDto> {
    const entry = await this.repository.findEntryById(id, userId);
    if (!entry) throw new NotFoundException('Journal entry not found');
    return this.toEntryResponse(entry);
  }

  async updateEntry(id: string, userId: string, dto: UpdateJournalEntryDto): Promise<JournalEntryResponseDto> {
    const data: Record<string, any> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.mood !== undefined) data.mood = dto.mood;
    if (dto.weather !== undefined) data.weather = dto.weather;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.isPrivate !== undefined) data.isPrivate = dto.isPrivate;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;

    const updated = await this.repository.updateEntry(id, userId, data);
    if (!updated) throw new NotFoundException('Journal entry not found');

    await this.events.emitJournalUpdated(userId, id);
    return this.toEntryResponse(updated);
  }

  async deleteEntry(id: string, userId: string): Promise<void> {
    const ok = await this.repository.deleteEntry(id, userId);
    if (!ok) throw new NotFoundException('Journal entry not found');
    await this.events.emitJournalDeleted(userId, id);
  }

  // ─── Memories ─────────────────────────────────────────────────────────────

  async createMemory(userId: string, dto: CreateMemoryDto): Promise<MemoryResponseDto> {
    if (dto.journalId && dto.quoteId) {
      throw new BadRequestException('Memory cannot have both journal and quote evidence');
    }

    if (dto.journalId) {
      const journal = await this.repository.findEntryById(dto.journalId, userId);
      if (!journal) {
        throw new NotFoundException('Journal entry not found or unauthorized');
      }
      if (!dto.memoryDate) {
        dto.memoryDate = journal.createdAt.toISOString();
      }
    }

    if (dto.quoteId) {
      const quote = await this.repository.findQuoteById(dto.quoteId, userId);
      if (!quote) {
        throw new NotFoundException('Quote not found or unauthorized');
      }
    }

    const memory = await this.repository.createMemory({
      userId,
      title: dto.title,
      description: dto.description,
      memoryDate: dto.memoryDate ? new Date(dto.memoryDate) : undefined,
      emotion: dto.emotion,
      isPinned: dto.isPinned ?? false,
      isPrivate: dto.isPrivate ?? true,
      coverImage: dto.coverImage,
      location: dto.location,
      journalId: dto.journalId,
      quoteId: dto.quoteId,
    });

    // Attach media if provided.
    //
    // Scoped to userId: this previously resolved library rows by ID alone, so
    // a caller could attach another user's library items to their own memory.
    //
    // Also restructured from O(N x 8) sequential findUnique calls — 20 media
    // IDs meant up to 160 round-trips in one request — to one batched query
    // per media type, run in parallel.
    const requestedIds = dto.mediaIds ?? [];
    if (requestedIds.length > 0) {
      const prismaAny = (this.repository as any).prismaAny();

      const perType = await Promise.all(
        Object.entries(MEDIA_LOOKUP).map(async ([type, cfg]) => {
          const delegate = prismaAny?.[cfg.delegate];
          if (!delegate) return [];
          const rows = await delegate.findMany({
            where: { id: { in: requestedIds }, userId, deletedAt: null },
            select: { id: true, [cfg.idField]: true },
          });
          return rows.map((row: Record<string, any>) => ({
            libraryId: row.id as string,
            type,
            mediaId: row[cfg.idField] as string,
          }));
        }),
      );

      // Preserve the caller's ordering rather than the per-type query order.
      const byLibraryId = new Map(perType.flat().map((m) => [m.libraryId, m]));
      for (const libId of requestedIds) {
        const match = byLibraryId.get(libId);
        if (match?.mediaId) {
          await this.repository.addMemoryMedia(memory.id, match.type, match.mediaId);
        }
      }
    }

    await this.events.emitMemoryCreated(userId, memory.id);
    await this.timelineFactory.createEvent(userId, this.timelineFactory.fromMemory(userId, memory.id, dto.title));

    return this.toMemoryResponse(memory);
  }

  async findMemories(
    userId: string,
    options: { cursor?: string; limit?: number; mediaId?: string; journalId?: string }
  ): Promise<{ items: MemoryResponseDto[]; hasMore: boolean; cursor: string | null }> {
    const limit = options.limit ?? 20;
    
    if (options.journalId) {
      const journal = await this.repository.findJournalEntryById(options.journalId, userId);
      if (!journal) throw new UnauthorizedException('Journal not found or unauthorized');
    }
    
    const items = await this.repository.findMemoriesByUserId(userId, limit, options.cursor, options.mediaId, options.journalId);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    return {
      items: sliced.map((m: any) => this.toMemoryResponse(m)),
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].createdAt.toISOString() : null,
    };
  }

  async findMemory(id: string, userId: string): Promise<MemoryResponseDto> {
    const memory = await this.repository.findMemoryById(id, userId);
    if (!memory) throw new NotFoundException('Memory not found');
    return this.toMemoryResponse(memory);
  }

  async updateMemory(id: string, userId: string, dto: UpdateMemoryDto): Promise<MemoryResponseDto> {
    const data: Record<string, any> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.memoryDate !== undefined) data.memoryDate = new Date(dto.memoryDate);
    if (dto.emotion !== undefined) data.emotion = dto.emotion;
    if (dto.isPinned !== undefined) data.isPinned = dto.isPinned;
    if (dto.isPrivate !== undefined) data.isPrivate = dto.isPrivate;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage;
    if (dto.location !== undefined) data.location = dto.location;

    const updated = await this.repository.updateMemory(id, userId, data);
    if (!updated) throw new NotFoundException('Memory not found');

    await this.events.emitMemoryUpdated(userId, id);
    return this.toMemoryResponse(updated);
  }

  async deleteMemory(id: string, userId: string): Promise<void> {
    const ok = await this.repository.deleteMemory(id, userId);
    if (!ok) throw new NotFoundException('Memory not found');
    await this.events.emitMemoryDeleted(userId, id);
  }

  // ─── Timeline Events ──────────────────────────────────────────────────────

  async createTimelineEvent(userId: string, dto: CreateTimelineEventDto): Promise<TimelineEventResponseDto> {
    const event = await this.repository.createTimelineEvent({
      userId,
      type: dto.type,
      title: dto.title,
      description: dto.description,
      eventDate: new Date(dto.eventDate),
      icon: dto.icon,
      color: dto.color,
    });

    return this.toTimelineResponse(event);
  }

  async findTimelineEvents(
    userId: string,
    year?: number,
    month?: number,
    cursor?: string,
    limit = 50,
  ): Promise<{ items: TimelineEventResponseDto[]; hasMore: boolean; cursor: string | null }> {
    const items = await this.repository.findTimelineEvents(userId, year, month, limit, cursor);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    return {
      items: sliced.map((e: any) => this.toTimelineResponse(e)),
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].eventDate.toISOString() : null,
    };
  }

  // ─── Quotes ───────────────────────────────────────────────────────────────

  async createQuote(
    userId: string,
    libraryId: string,
    dto: CreateQuoteDto,
    mediaType: string,
  ): Promise<QuoteResponseDto> {
    // Resolve the media id from the CALLER'S library item.
    const libItem = await this.findLibraryMediaId(libraryId, mediaType, userId);
    if (!libItem) throw new NotFoundException('Library item not found');

    const mediaId = libItem[`${mediaType}Id`];
    if (!mediaId) throw new NotFoundException('Library item not found');

    const quote = await this.repository.createQuote({
      userId,
      content: dto.content,
      speaker: dto.speaker,
      language: dto.language,
      translation: dto.translation,
      note: dto.note,
      mediaType,
      mediaId,
    });

    await this.events.emitQuoteCreated(userId, quote.id);
    await this.timelineFactory.createEvent(userId, this.timelineFactory.fromQuote(userId, quote.id, dto.content));

    return this.toQuoteResponse(quote);
  }

  async findQuotes(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: QuoteResponseDto[]; hasMore: boolean; cursor: string | null }> {
    const items = await this.repository.findQuotesByUserId(userId, limit, cursor);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    return {
      items: sliced.map((q: any) => this.toQuoteResponse(q)),
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].createdAt.toISOString() : null,
    };
  }

  async updateQuote(quoteId: string, userId: string, dto: UpdateQuoteDto): Promise<QuoteResponseDto> {
    const data: Record<string, any> = {};
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.speaker !== undefined) data.speaker = dto.speaker;
    if (dto.language !== undefined) data.language = dto.language;
    if (dto.translation !== undefined) data.translation = dto.translation;
    if (dto.note !== undefined) data.note = dto.note;

    const updated = await this.repository.updateQuote(quoteId, userId, data);
    if (!updated) throw new NotFoundException('Quote not found');

    await this.events.emitQuoteUpdated(userId, quoteId);
    return this.toQuoteResponse(updated);
  }

  async deleteQuote(quoteId: string, userId: string): Promise<void> {
    const ok = await this.repository.deleteQuote(quoteId, userId);
    if (!ok) throw new NotFoundException('Quote not found');
    await this.events.emitQuoteDeleted(userId, quoteId);
  }

  // ─── Highlights ───────────────────────────────────────────────────────────

  async createHighlight(
    userId: string,
    libraryId: string,
    dto: CreateHighlightDto,
    mediaType: string,
  ): Promise<HighlightResponseDto> {
    const libItem = await this.findLibraryMediaId(libraryId, mediaType, userId);
    if (!libItem) throw new NotFoundException('Library item not found');

    const mediaId = libItem[`${mediaType}Id`];
    if (!mediaId) throw new NotFoundException('Library item not found');

    const highlight = await this.repository.createHighlight({
      userId,
      title: dto.title,
      description: dto.description,
      timestamp: dto.timestamp,
      chapter: dto.chapter,
      page: dto.page,
      episode: dto.episode,
      season: dto.season,
      track: dto.track,
      lesson: dto.lesson,
      mediaType,
      mediaId,
    });

    await this.events.emitHighlightCreated(userId, highlight.id);
    await this.timelineFactory.createEvent(userId, this.timelineFactory.fromHighlight(userId, highlight.id, dto.title));

    return this.toHighlightResponse(highlight);
  }

  async findHighlights(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: HighlightResponseDto[]; hasMore: boolean; cursor: string | null }> {
    const items = await this.repository.findHighlightsByUserId(userId, limit, cursor);
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    return {
      items: sliced.map((h: any) => this.toHighlightResponse(h)),
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].createdAt.toISOString() : null,
    };
  }

  async updateHighlight(highlightId: string, userId: string, dto: UpdateHighlightDto): Promise<HighlightResponseDto> {
    const data: Record<string, any> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.timestamp !== undefined) data.timestamp = dto.timestamp;
    if (dto.chapter !== undefined) data.chapter = dto.chapter;
    if (dto.page !== undefined) data.page = dto.page;
    if (dto.episode !== undefined) data.episode = dto.episode;
    if (dto.season !== undefined) data.season = dto.season;
    if (dto.track !== undefined) data.track = dto.track;
    if (dto.lesson !== undefined) data.lesson = dto.lesson;

    const updated = await this.repository.updateHighlight(highlightId, userId, data);
    if (!updated) throw new NotFoundException('Highlight not found');

    await this.events.emitHighlightUpdated(userId, highlightId);
    return this.toHighlightResponse(updated);
  }

  async deleteHighlight(highlightId: string, userId: string): Promise<void> {
    const ok = await this.repository.deleteHighlight(highlightId, userId);
    if (!ok) throw new NotFoundException('Highlight not found');
    await this.events.emitHighlightDeleted(userId, highlightId);
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  async getStatistics(userId: string): Promise<JournalStatisticsDto> {
    return this.statsService.getStats(userId);
  }

  getAllPrompts(): string[] {
    return this.promptService.getAllPrompts();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Resolve the catalog media ID behind one of the caller's library items.
   *
   * userId is required. Without it this looked up any library row by ID, so
   * POST /library/<another-user's-item-id>/quotes both leaked the existence of
   * that row (201 vs 404 is an oracle) and bound its media into the caller's
   * own quote. Every other journal query is user-scoped; these two were the
   * outliers.
   */
  private async findLibraryMediaId(
    libraryId: string,
    type: string,
    userId: string,
  ): Promise<Record<string, any> | null> {
    const cfg = MEDIA_LOOKUP[type];
    if (!cfg) return null;
    const delegate = (this.repository as any).prismaAny()?.[cfg.delegate];
    if (!delegate) return null;
    return delegate.findFirst({
      where: { id: libraryId, userId, deletedAt: null },
      select: { [cfg.idField]: true },
    });
  }

  private toEntryResponse(e: any): JournalEntryResponseDto {
    return {
      id: e.id,
      title: e.title ?? null,
      content: e.content,
      mood: e.mood ?? null,
      weather: e.weather ?? null,
      location: e.location ?? null,
      isPrivate: e.isPrivate ?? true,
      coverImage: e.coverImage ?? null,
      createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: e.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toMemoryResponse(entity: any): MemoryResponseDto {
    const mediaIds = (entity.media || [])
      .map((m: any) => m.movieId || m.tvShowId || m.animeId || m.bookId || m.gameId || m.musicAlbumId || m.podcastId || m.courseId)
      .filter(Boolean);

    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      memoryDate: entity.memoryDate?.toISOString(),
      emotion: entity.emotion,
      isPinned: entity.isPinned,
      isPrivate: entity.isPrivate,
      coverImage: entity.coverImage,
      location: entity.location,
      mediaCount: entity._count?.media || 0,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      journalId: entity.journalId || null,
      quoteId: entity.quoteId || null,
      mediaIds: mediaIds,
    };
  }

  private toTimelineResponse(e: any): TimelineEventResponseDto {
    return {
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description ?? null,
      eventDate: e.eventDate?.toISOString() ?? new Date().toISOString(),
      icon: e.icon ?? null,
      color: e.color ?? null,
      metadata: e.metadata ?? null,
      createdAt: e.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toQuoteResponse(q: any): QuoteResponseDto {
    return {
      id: q.id,
      content: q.content,
      speaker: q.speaker ?? null,
      language: q.language ?? null,
      translation: q.translation ?? null,
      note: q.note ?? null,
      createdAt: q.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: q.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toHighlightResponse(h: any): HighlightResponseDto {
    return {
      id: h.id,
      title: h.title,
      description: h.description ?? null,
      timestamp: h.timestamp ?? null,
      chapter: h.chapter ?? null,
      page: h.page ?? null,
      episode: h.episode ?? null,
      season: h.season ?? null,
      track: h.track ?? null,
      lesson: h.lesson ?? null,
      createdAt: h.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: h.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}

const MEDIA_LOOKUP: Record<string, { delegate: string; idField: string }> = {
  movie: { delegate: 'userMovie', idField: 'movieId' },
  tvShow: { delegate: 'userTvShow', idField: 'tvShowId' },
  anime: { delegate: 'userAnime', idField: 'animeId' },
  book: { delegate: 'userBook', idField: 'bookId' },
  game: { delegate: 'userGame', idField: 'gameId' },
  musicAlbum: { delegate: 'userMusicAlbum', idField: 'musicAlbumId' },
  podcast: { delegate: 'userPodcast', idField: 'podcastId' },
  course: { delegate: 'userCourse', idField: 'courseId' },
};
