/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalRepository {
  constructor(private readonly prisma: PrismaService) {}

  public prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  // ─── Journal Entries ──────────────────────────────────────────────────────

  async createEntry(data: {
    userId: string;
    title?: string;
    content: string;
    mood?: string;
    weather?: string;
    location?: string;
    isPrivate?: boolean;
    coverImage?: string;
  }): Promise<Record<string, any>> {
    return this.prismaAny().journalEntry.create({ data });
  }

  async findEntryById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const entry = await this.prismaAny().journalEntry.findUnique({ where: { id } });
    if (!entry || (userId && entry.userId !== userId)) return null;
    return entry;
  }

  async findEntriesByUserId(userId: string, limit = 50, cursor?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    return this.prismaAny().journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
  }

  async updateEntry(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().journalEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;
    return this.prismaAny().journalEntry.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async deleteEntry(id: string, userId: string): Promise<boolean> {
    const existing = await this.prismaAny().journalEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;
    await this.prismaAny().journalEntry.delete({ where: { id } });
    return true;
  }

  async countEntries(userId: string): Promise<number> {
    return this.prismaAny().journalEntry.count({ where: { userId } });
  }

  async getRecentEntryDates(userId: string, limit = 30): Promise<Date[]> {
    const entries = await this.prismaAny().journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { createdAt: true },
    });
    return entries.map((e: any) => e.createdAt);
  }

  // ─── Memories ─────────────────────────────────────────────────────────────

  async createMemory(data: {
    userId: string;
    title: string;
    description?: string;
    memoryDate?: Date;
    emotion?: string;
    isPinned?: boolean;
    isPrivate?: boolean;
    coverImage?: string;
    location?: string;
  }): Promise<Record<string, any>> {
    return this.prismaAny().memory.create({ data });
  }

  async findMemoryById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const memory = await this.prismaAny().memory.findUnique({
      where: { id },
      include: { _count: { select: { media: true } } },
    });
    if (!memory || (userId && memory.userId !== userId)) return null;
    return memory;
  }

  async findMemoriesByUserId(userId: string, limit = 50, cursor?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    return this.prismaAny().memory.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
      include: { _count: { select: { media: true } } },
    });
  }

  async updateMemory(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().memory.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;
    return this.prismaAny().memory.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async deleteMemory(id: string, userId: string): Promise<boolean> {
    const existing = await this.prismaAny().memory.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;
    await this.prismaAny().memoryMedia.deleteMany({ where: { memoryId: id } });
    await this.prismaAny().memory.delete({ where: { id } });
    return true;
  }

  async countMemories(userId: string): Promise<number> {
    return this.prismaAny().memory.count({ where: { userId } });
  }

  async addMemoryMedia(memoryId: string, mediaType: string, mediaId: string): Promise<void> {
    const mediaField = `${mediaType}Id`;
    try {
      await this.prismaAny().memoryMedia.create({
        data: { memoryId, [mediaField]: mediaId },
      });
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }
  }

  // ─── Timeline Events ──────────────────────────────────────────────────────

  async findTimelineEvents(
    userId: string,
    year?: number,
    month?: number,
    limit = 100,
    cursor?: string,
  ): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (year !== undefined && month !== undefined) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      where.eventDate = { gte: start, lte: end };
    } else if (year !== undefined) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      where.eventDate = { gte: start, lte: end };
    }
    if (cursor) where.eventDate = { ...where.eventDate, lt: new Date(cursor) };

    return this.prismaAny().timelineEvent.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      take: limit + 1,
    });
  }

  async createTimelineEvent(data: {
    userId: string;
    type: string;
    title: string;
    description?: string;
    eventDate: Date;
    icon?: string;
    color?: string;
    metadata?: any;
  }): Promise<Record<string, any>> {
    return this.prismaAny().timelineEvent.create({ data });
  }

  async countTimelineEvents(userId: string): Promise<number> {
    return this.prismaAny().timelineEvent.count({ where: { userId } });
  }

  // ─── Quotes ───────────────────────────────────────────────────────────────

  async createQuote(data: {
    userId: string;
    content: string;
    speaker?: string;
    language?: string;
    translation?: string;
    note?: string;
    mediaType: string;
    mediaId: string;
  }): Promise<Record<string, any>> {
    const mediaField = `${data.mediaType}Id`;
    return this.prismaAny().favoriteQuote.create({
      data: {
        userId: data.userId,
        content: data.content,
        speaker: data.speaker ?? null,
        language: data.language ?? null,
        translation: data.translation ?? null,
        note: data.note ?? null,
        [mediaField]: data.mediaId,
      },
    });
  }

  async findQuoteById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const quote = await this.prismaAny().favoriteQuote.findUnique({ where: { id } });
    if (!quote || (userId && quote.userId !== userId)) return null;
    return quote;
  }

  async findQuotesByUserId(userId: string, limit = 50, cursor?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    return this.prismaAny().favoriteQuote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
  }

  async updateQuote(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().favoriteQuote.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;
    return this.prismaAny().favoriteQuote.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async deleteQuote(id: string, userId: string): Promise<boolean> {
    const existing = await this.prismaAny().favoriteQuote.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;
    await this.prismaAny().favoriteQuote.delete({ where: { id } });
    return true;
  }

  async countQuotes(userId: string): Promise<number> {
    return this.prismaAny().favoriteQuote.count({ where: { userId } });
  }

  // ─── Highlights ───────────────────────────────────────────────────────────

  async createHighlight(data: {
    userId: string;
    title: string;
    description?: string;
    timestamp?: number;
    chapter?: number;
    page?: number;
    episode?: number;
    season?: number;
    track?: number;
    lesson?: number;
    mediaType: string;
    mediaId: string;
  }): Promise<Record<string, any>> {
    const mediaField = `${data.mediaType}Id`;
    return this.prismaAny().highlight.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description ?? null,
        timestamp: data.timestamp ?? null,
        chapter: data.chapter ?? null,
        page: data.page ?? null,
        episode: data.episode ?? null,
        season: data.season ?? null,
        track: data.track ?? null,
        lesson: data.lesson ?? null,
        [mediaField]: data.mediaId,
      },
    });
  }

  async findHighlightById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const highlight = await this.prismaAny().highlight.findUnique({ where: { id } });
    if (!highlight || (userId && highlight.userId !== userId)) return null;
    return highlight;
  }

  async findHighlightsByUserId(userId: string, limit = 50, cursor?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    return this.prismaAny().highlight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
  }

  async updateHighlight(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().highlight.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;
    return this.prismaAny().highlight.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async deleteHighlight(id: string, userId: string): Promise<boolean> {
    const existing = await this.prismaAny().highlight.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;
    await this.prismaAny().highlight.delete({ where: { id } });
    return true;
  }

  async countHighlights(userId: string): Promise<number> {
    return this.prismaAny().highlight.count({ where: { userId } });
  }
}
