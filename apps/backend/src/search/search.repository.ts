/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SearchResultItemDto } from './dto';
import { asHost, userLibraryDelegateFor } from '../common/prisma-delegates';

interface SearchableMediaConfig {
  delegate: string;
  titleField: string;
  descriptionField: string;
}

const MEDIA_CONFIG: Record<string, SearchableMediaConfig> = {
  movie: { delegate: 'movie', titleField: 'title', descriptionField: 'overview' },
  tvShow: { delegate: 'tvShow', titleField: 'title', descriptionField: 'overview' },
  anime: { delegate: 'anime', titleField: 'title', descriptionField: 'description' },
  book: { delegate: 'book', titleField: 'title', descriptionField: 'description' },
  game: { delegate: 'game', titleField: 'title', descriptionField: 'description' },
  musicAlbum: { delegate: 'musicAlbum', titleField: 'title', descriptionField: 'description' },
  podcast: { delegate: 'podcast', titleField: 'title', descriptionField: 'description' },
  course: { delegate: 'course', titleField: 'title', descriptionField: 'description' },
};

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  // ─── Media Search ─────────────────────────────────────────────────────────

  async searchMedia(q: string, typeFilter?: string, limit = 20): Promise<SearchResultItemDto[]> {
    const results: SearchResultItemDto[] = [];
    const qLower = q.toLowerCase();
    const types = typeFilter ? [typeFilter] : Object.keys(MEDIA_CONFIG);

    for (const type of types) {
      const cfg = MEDIA_CONFIG[type];
      if (!cfg) continue;

      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) continue;

      const items = await delegate.findMany({
        where: {
          OR: [
            { [cfg.titleField]: { contains: qLower, mode: 'insensitive' } },
            { originalTitle: { contains: qLower, mode: 'insensitive' } },
            { slug: { contains: qLower, mode: 'insensitive' } },
            { [cfg.descriptionField]: { contains: qLower, mode: 'insensitive' } },
          ],
        },
        take: limit + 1,
        select: {
          id: true,
          title: true,
          slug: true,
          posterUrl: true,
          releaseYear: true,
          [cfg.descriptionField]: true,
        },
      });

      for (const item of items) {
        const score = this.calculateScore(item, qLower, cfg);
        const matchedField = this.findMatchField(item, qLower, cfg);
        const matchedText = matchedField ? item[matchedField]?.slice(0, 200) : null;

        results.push({
          id: item.id,
          type,
          title: item.title ?? item.slug ?? 'Unknown',
          subtitle: item.releaseYear ? String(item.releaseYear) : null,
          description: item[cfg.descriptionField] ?? null,
          imageUrl: item.posterUrl ?? null,
          matchedField,
          matchedText,
          score,
          metadata: { slug: item.slug },
          createdAt: null,
          updatedAt: null,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  // ─── Library Search ───────────────────────────────────────────────────────

  async searchLibrary(userId: string, q: string, typeFilter?: string, limit = 20): Promise<SearchResultItemDto[]> {
    const results: SearchResultItemDto[] = [];
    const qLower = q.toLowerCase();
    const types = typeFilter ? [typeFilter] : Object.keys(MEDIA_CONFIG);

    for (const type of types) {
      const cfg = MEDIA_CONFIG[type];
      if (!cfg) continue;

      // Resolve through the verified allowlist rather than building the
      // delegate name by string manipulation. The old
      // `user${Type}` concatenation was undiscoverable by grep and produced a
      // silent `continue` — i.e. that media type quietly missing from every
      // search result — for any name it got wrong.
      const resolved = userLibraryDelegateFor(asHost(this.prisma), type);
      if (!resolved) continue;
      const delegate = resolved.delegate;

      const items = await delegate.findMany({
        where: {
          userId,
          deletedAt: null,
          [cfg.delegate]: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              { [cfg.descriptionField]: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        take: limit + 1,
        include: {
          [cfg.delegate]: {
            select: {
              id: true,
              title: true,
              slug: true,
              posterUrl: true,
              releaseYear: true,
              [cfg.descriptionField]: true,
            },
          },
        },
      });

      for (const raw of items) {
        // Fields read off the junction row itself. Declared once so the
        // accesses below stay checked.
        const item = raw as Record<string, unknown> & {
          id: string;
          status?: string | null;
          createdAt?: Date | null;
          updatedAt?: Date | null;
        };
        // The joined catalog row sits under a per-type key. Narrow it once
        // here rather than reading through `any` at each access below.
        const media = item[cfg.delegate] as Record<string, string | null> | undefined;
        if (!media) continue;

        const title = media.title?.toLowerCase() ?? '';
        const desc = media[cfg.descriptionField]?.toLowerCase() ?? '';
        const slug = media.slug?.toLowerCase() ?? '';

        if (!title.includes(qLower) && !desc.includes(qLower) && !slug.includes(qLower)) continue;

        const score = this.calculateScore(media, qLower, cfg);
        results.push({
          id: item.id,
          type,
          title: media.title ?? 'Unknown',
          subtitle: `${type} · ${item.status ?? ''}`,
          description: media[cfg.descriptionField] ?? null,
          imageUrl: media.posterUrl ?? null,
          matchedField: title.includes(qLower) ? 'title' : 'description',
          matchedText: null,
          score: score + 10, // boost library results
          metadata: { slug: media.slug, status: item.status, mediaId: media.id },
          createdAt: item.createdAt?.toISOString() ?? null,
          updatedAt: item.updatedAt?.toISOString() ?? null,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  // ─── Journal Search ───────────────────────────────────────────────────────

  async searchJournal(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().journalEntry;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: qLower, mode: 'insensitive' } },
          { content: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'journal',
      title: item.title ?? 'Untitled',
      subtitle: item.mood ?? null,
      description: item.content?.slice(0, 300) ?? null,
      imageUrl: item.coverImage ?? null,
      matchedField: item.title?.toLowerCase().includes(qLower) ? 'title' : 'content',
      matchedText: this.extractMatch(item.content ?? item.title ?? '', qLower),
      score: item.title?.toLowerCase().includes(qLower) ? 20 : 10,
      metadata: { mood: item.mood },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Collections Search ───────────────────────────────────────────────────

  async searchCollections(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().collection;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: qLower, mode: 'insensitive' } },
          { description: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'collection',
      title: item.name,
      subtitle: `Collection · ${item.visibility ?? 'PRIVATE'}`,
      description: item.description ?? null,
      imageUrl: item.coverImage ?? null,
      matchedField: item.name?.toLowerCase().includes(qLower) ? 'name' : 'description',
      matchedText: null,
      score: item.name?.toLowerCase().includes(qLower) ? 15 : 8,
      metadata: { slug: item.slug, visibility: item.visibility, isSmartCollection: item.isSmartCollection },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Memories Search ──────────────────────────────────────────────────────

  async searchMemories(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().memory;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { title: { contains: qLower, mode: 'insensitive' } },
          { description: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'memory',
      title: item.title,
      subtitle: item.emotion ?? null,
      description: item.description?.slice(0, 300) ?? null,
      imageUrl: item.coverImage ?? null,
      matchedField: item.title?.toLowerCase().includes(qLower) ? 'title' : 'description',
      matchedText: null,
      score: item.title?.toLowerCase().includes(qLower) ? 15 : 8,
      metadata: { emotion: item.emotion, isPinned: item.isPinned },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Quotes Search ────────────────────────────────────────────────────────

  async searchQuotes(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().favoriteQuote;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { content: { contains: qLower, mode: 'insensitive' } },
          { speaker: { contains: qLower, mode: 'insensitive' } },
          { note: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'quote',
      title: item.speaker ? `"${item.content?.slice(0, 80)}" — ${item.speaker}` : `"${item.content?.slice(0, 80)}"`,
      subtitle: item.speaker ?? null,
      description: item.note ?? null,
      imageUrl: null,
      matchedField: item.content?.toLowerCase().includes(qLower) ? 'content' : 'speaker',
      matchedText: this.extractMatch(item.content, qLower),
      score: 10,
      metadata: { language: item.language },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Highlights Search ────────────────────────────────────────────────────

  async searchHighlights(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().highlight;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: qLower, mode: 'insensitive' } },
          { description: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'highlight',
      title: item.title,
      subtitle: item.page ? `p.${item.page}` : item.timestamp ? `@${item.timestamp}s` : null,
      description: item.description?.slice(0, 300) ?? null,
      imageUrl: null,
      matchedField: item.title?.toLowerCase().includes(qLower) ? 'title' : 'description',
      matchedText: null,
      score: 10,
      metadata: { page: item.page, timestamp: item.timestamp, chapter: item.chapter },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Shelves Search ───────────────────────────────────────────────────────

  async searchShelves(userId: string, q: string, limit = 10): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().shelf;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: qLower, mode: 'insensitive' } },
          { description: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'shelf',
      title: item.title,
      subtitle: `Shelf · ${item.visibility ?? 'PRIVATE'}`,
      description: item.description ?? null,
      imageUrl: null,
      matchedField: item.title?.toLowerCase().includes(qLower) ? 'title' : 'description',
      matchedText: null,
      score: 12,
      metadata: { slug: item.slug, visibility: item.visibility },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    }));
  }

  // ─── Timeline Search ──────────────────────────────────────────────────────

  async searchTimeline(userId: string, q: string, limit = 20): Promise<SearchResultItemDto[]> {
    const qLower = q.toLowerCase();
    const delegate = this.prismaAny().timelineEvent;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: qLower, mode: 'insensitive' } },
          { description: { contains: qLower, mode: 'insensitive' } },
        ],
      },
      take: limit + 1,
      orderBy: { eventDate: 'desc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      type: 'timeline',
      title: item.title,
      subtitle: item.type,
      description: item.description ?? null,
      imageUrl: null,
      matchedField: item.title?.toLowerCase().includes(qLower) ? 'title' : 'description',
      matchedText: null,
      score: 5,
      metadata: { eventType: item.type, eventDate: item.eventDate?.toISOString() },
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: null,
    }));
  }

  // ─── Search History ───────────────────────────────────────────────────────

  async recordSearch(userId: string, query: string, filters: Record<string, any>, resultsCount: number): Promise<void> {
    const delegate = this.prismaAny().searchHistory;
    if (!delegate) return;

    // Upsert: update existing search for same query+user or create new
    const existing = await delegate.findFirst({
      where: { userId, query },
      orderBy: { searchedAt: 'desc' },
    });

    if (existing) {
      await delegate.update({
        where: { id: existing.id },
        data: { searchedAt: new Date(), resultsCount, filters },
      });
    } else {
      await delegate.create({
        data: { userId, query, filters, resultsCount },
      });
    }
  }

  async getRecentSearches(userId: string, limit = 10): Promise<string[]> {
    const delegate = this.prismaAny().searchHistory;
    if (!delegate) return [];

    const items = await delegate.findMany({
      where: { userId },
      orderBy: { searchedAt: 'desc' },
      take: limit + 1,
      select: { query: true },
    });

    return items.map((i: any) => i.query);
  }

  async clearSearchHistory(userId: string): Promise<void> {
    const delegate = this.prismaAny().searchHistory;
    if (!delegate) return;
    await delegate.deleteMany({ where: { userId } });
  }

  // ─── Suggestions ──────────────────────────────────────────────────────────

  async getPrefixSuggestions(
    q: string,
    userId: string,
    limit = 8,
  ): Promise<Array<{ text: string; type: string; score: number }>> {
    const results: Array<{ text: string; type: string; score: number }> = [];
    const qLower = q.toLowerCase();

    // Media title prefix matching
    for (const [_type, cfg] of Object.entries(MEDIA_CONFIG)) {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) continue;

      const items = await delegate.findMany({
        where: { [cfg.titleField]: { startsWith: qLower, mode: 'insensitive' } },
        take: 3,
        select: { [cfg.titleField]: true },
      });

      for (const item of items) {
        results.push({ text: item[cfg.titleField], type: _type, score: 10 });
      }
    }

    // User's journal title prefix
    const journalDelegate = this.prismaAny().journalEntry;
    if (journalDelegate) {
      const entries = await journalDelegate.findMany({
        where: { userId, title: { startsWith: qLower, mode: 'insensitive' } },
        take: 3,
        select: { title: true },
      });
      for (const e of entries) {
        if (e.title) results.push({ text: e.title, type: 'journal', score: 8 });
      }
    }

    // User's collection name prefix
    const collDelegate = this.prismaAny().collection;
    if (collDelegate) {
      const colls = await collDelegate.findMany({
        where: { userId, name: { startsWith: qLower, mode: 'insensitive' } },
        take: 3,
        select: { name: true },
      });
      for (const c of colls) {
        results.push({ text: c.name, type: 'collection', score: 8 });
      }
    }

    // User's memory title prefix
    const memDelegate = this.prismaAny().memory;
    if (memDelegate) {
      const mems = await memDelegate.findMany({
        where: { userId, title: { startsWith: qLower, mode: 'insensitive' } },
        take: 3,
        select: { title: true },
      });
      for (const m of mems) {
        results.push({ text: m.title, type: 'memory', score: 8 });
      }
    }

    return results.slice(0, limit);
  }

  // ─── Trending / Discovery ─────────────────────────────────────────────────

  async getTrendingMedia(limit = 10): Promise<SearchResultItemDto[]> {
    const results: SearchResultItemDto[] = [];

    for (const [type, cfg] of Object.entries(MEDIA_CONFIG)) {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) continue;

      const items = await delegate.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, posterUrl: true, releaseYear: true, [cfg.descriptionField]: true },
      });

      for (const item of items) {
        results.push({
          id: item.id,
          type,
          title: item.title,
          subtitle: item.releaseYear ? String(item.releaseYear) : null,
          description: item[cfg.descriptionField] ?? null,
          imageUrl: item.posterUrl ?? null,
          matchedField: null,
          matchedText: null,
          score: 5,
          metadata: { slug: item.slug },
          createdAt: null,
          updatedAt: null,
        });
      }
    }

    return results.slice(0, limit);
  }

  // ─── Filters ──────────────────────────────────────────────────────────────

  async getFilterOptions(): Promise<{
    types: string[];
    statuses: string[];
    genres: string[];
    years: number[];
    moods: string[];
  }> {
    const genres = new Set<string>();
    const years = new Set<number>();

    for (const [, cfg] of Object.entries(MEDIA_CONFIG)) {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) continue;

      const items = await delegate.findMany({
        take: 100,
        select: { genres: true, releaseYear: true },
      });

      for (const item of items) {
        if (item.genres) {
          for (const g of item.genres) genres.add(g);
        }
        if (item.releaseYear) years.add(item.releaseYear);
      }
    }

    return {
      types: Object.keys(MEDIA_CONFIG),
      statuses: [
        'PLANNING',
        'WATCHING',
        'READING',
        'PLAYING',
        'LISTENING',
        'LEARNING',
        'PAUSED',
        'COMPLETED',
        'DROPPED',
        'ARCHIVED',
      ],
      genres: [...genres].sort(),
      years: [...years].sort((a, b) => b - a),
      moods: [
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
      ],
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private calculateScore(item: any, q: string, cfg: SearchableMediaConfig): number {
    let score = 0;
    const title = (item[cfg.titleField] ?? '').toLowerCase();
    const slug = (item.slug ?? '').toLowerCase();
    const desc = (item[cfg.descriptionField] ?? '').toLowerCase();

    if (title === q)
      score += 100; // exact title match
    else if (title.startsWith(q))
      score += 80; // prefix match
    else if (title.includes(q)) score += 60; // substring match

    if (slug === q) score += 50;
    else if (slug.startsWith(q)) score += 40;
    else if (slug.includes(q)) score += 30;

    if (desc.includes(q)) score += 20;

    return score;
  }

  private findMatchField(item: any, q: string, cfg: SearchableMediaConfig): string | null {
    if ((item[cfg.titleField] ?? '').toLowerCase().includes(q)) return cfg.titleField;
    if ((item.slug ?? '').toLowerCase().includes(q)) return 'slug';
    if ((item[cfg.descriptionField] ?? '').toLowerCase().includes(q)) return cfg.descriptionField;
    return null;
  }

  private extractMatch(text: string, q: string): string | null {
    if (!text) return null;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return null;

    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + q.length + 60);
    let snippet = text.slice(start, end).trim();

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }
}
