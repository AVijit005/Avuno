import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getLibraryTypes } from '../library';
import { asHost, asRow, asRows, delegate, type QueryableDelegate } from '../common/prisma-delegates';
import { type UserLibraryWhereInput, type UserLibraryUpdateInput } from '../common';

interface InteractionModelConfig {
  userDelegate: string;
  mediaDelegate: string;
  mediaIdField: string;
}

export interface LibraryItemWithMetadata {
  id: string;
  userId: string;
  rating: number | null;
  favorite: boolean;
  bookmarked: boolean;
  bookmarkedAt: Date | null;
  metadata: Prisma.InputJsonValue;
  status: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  lastInteractionAt: Date | null;
  progress: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _mediaType?: string;
}

@Injectable()
export class InteractionRepository {
  private readonly config: Record<string, InteractionModelConfig>;

  constructor(private readonly prisma: PrismaService) {
    this.config = {
      movie: { userDelegate: 'userMovie', mediaDelegate: 'movie', mediaIdField: 'movieId' },
      tvShow: { userDelegate: 'userTvShow', mediaDelegate: 'tvShow', mediaIdField: 'tvShowId' },
      anime: { userDelegate: 'userAnime', mediaDelegate: 'anime', mediaIdField: 'animeId' },
      book: { userDelegate: 'userBook', mediaDelegate: 'book', mediaIdField: 'bookId' },
      game: { userDelegate: 'userGame', mediaDelegate: 'game', mediaIdField: 'gameId' },
      musicAlbum: { userDelegate: 'userMusicAlbum', mediaDelegate: 'musicAlbum', mediaIdField: 'musicAlbumId' },
      podcast: { userDelegate: 'userPodcast', mediaDelegate: 'podcast', mediaIdField: 'podcastId' },
      course: { userDelegate: 'userCourse', mediaDelegate: 'course', mediaIdField: 'courseId' },
    };
  }

  private getCfg(type: string): InteractionModelConfig | null {
    return this.config[type] ?? null;
  }

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private lib(type: string): QueryableDelegate | null {
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    return delegate(this.host(), cfg.userDelegate);
  }

  async findLibraryItem(id: string, type: string): Promise<LibraryItemWithMetadata | null> {
    const del = this.lib(type);
    if (!del) return null;
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    const item = await del.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
    return asRow<LibraryItemWithMetadata>(item as Record<string, unknown> | null);
  }

  async updateLibraryItem(
    id: string,
    type: string,
    userId: string,
    data: UserLibraryUpdateInput,
  ): Promise<LibraryItemWithMetadata | null> {
    const del = this.lib(type);
    if (!del) return null;
    const cfg = this.getCfg(type);
    if (!cfg) return null;

    const updateData = { ...data, updatedAt: new Date(), lastInteractionAt: new Date() };

    const result = await del.updateMany({ where: { id, userId }, data: updateData });
    if (result.count === 0) return null;

    const updated = await del.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
    return asRow<LibraryItemWithMetadata>(updated as Record<string, unknown> | null);
  }

  async recordHistory(
    userId: string,
    eventType: string,
    libraryId: string,
    mediaType: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    const activityDelegate = delegate(this.host(), 'activityFeed');

    const activityTypeMap: Record<string, string> = {
      movie: 'WATCH',
      tvShow: 'WATCH',
      anime: 'WATCH',
      book: 'READ',
      game: 'PLAY',
      musicAlbum: 'LISTEN',
      podcast: 'LISTEN',
      course: 'LEARN',
    };
    const type = activityTypeMap[mediaType] ?? 'WATCH';

    await activityDelegate.create({
      data: {
        userId,
        type,
        title: eventType,
        description: `${eventType} on ${mediaType} item ${libraryId}`,
        metadata: { ...(metadata as object), libraryId, mediaType, eventType },
        visibility: 'PRIVATE',
      },
    });
  }

  async findFavorites(userId: string, type?: string, cursor?: string, limit = 20): Promise<LibraryItemWithMetadata[]> {
    const results: LibraryItemWithMetadata[] = [];

    const types = type ? [type] : getLibraryTypes();

    for (const t of types) {
      const cfg = this.getCfg(t);
      if (!cfg) continue;
      const del = this.lib(t);
      if (!del) continue;

      const where: UserLibraryWhereInput = { userId, favorite: true, deletedAt: null };
      if (cursor) {
        (where as Record<string, unknown>).updatedAt = { lt: cursor };
      }

      const items = await del.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        const row = asRow<LibraryItemWithMetadata>(item as Record<string, unknown>);
        if (row) results.push({ ...row, _mediaType: t });
      }
    }

    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results.slice(0, limit + 1);
  }

  async findBookmarks(userId: string, type?: string, cursor?: string, limit = 20): Promise<LibraryItemWithMetadata[]> {
    const results: LibraryItemWithMetadata[] = [];

    const types = type ? [type] : getLibraryTypes();

    for (const t of types) {
      const cfg = this.getCfg(t);
      if (!cfg) continue;
      const del = this.lib(t);
      if (!del) continue;

      const where: UserLibraryWhereInput = {
        userId,
        deletedAt: null,
        bookmarked: true,
      };
      if (cursor) {
        (where as Record<string, unknown>).updatedAt = { lt: cursor };
      }

      const items = await del.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        const row = asRow<LibraryItemWithMetadata>(item as Record<string, unknown>);
        if (row) results.push({ ...row, _mediaType: t });
      }
    }

    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results.slice(0, limit + 1);
  }

  async findWithReviews(
    userId: string,
    type?: string,
    cursor?: string,
    limit = 20,
  ): Promise<LibraryItemWithMetadata[]> {
    const results: LibraryItemWithMetadata[] = [];

    const types = type ? [type] : getLibraryTypes();

    for (const t of types) {
      const cfg = this.getCfg(t);
      if (!cfg) continue;
      const del = this.lib(t);
      if (!del) continue;

      const where: Record<string, unknown> = {
        userId,
        deletedAt: null,
        metadata: { path: ['review'], not: null },
      };
      if (cursor) {
        where.updatedAt = { lt: cursor };
      }

      const items = await del.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        const row = asRow<LibraryItemWithMetadata>(item as Record<string, unknown>);
        if (row) results.push({ ...row, _mediaType: t });
      }
    }

    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results.slice(0, limit + 1);
  }

  async findHistory(userId: string, type?: string, cursor?: string, limit = 20): Promise<Record<string, unknown>[]> {
    const activityDelegate = delegate(this.host(), 'activityFeed');

    const where: Record<string, unknown> = { userId };
    if (type) {
      const typeMap: Record<string, string> = {
        movie: 'WATCH',
        tvshow: 'WATCH',
        anime: 'WATCH',
        book: 'READ',
        game: 'PLAY',
        musicalbum: 'LISTEN',
        podcast: 'LISTEN',
        course: 'LEARN',
      };
      where.type = typeMap[type.toLowerCase()] ?? type.toUpperCase();
    }
    if (cursor) {
      where.createdAt = { lt: cursor };
    }

    const items = await activityDelegate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    return asRows<Record<string, unknown>>(items);
  }

  async findHistoryByLibraryItem(
    userId: string,
    libraryId: string,
    _mediaType: string,
  ): Promise<Record<string, unknown>[]> {
    const activityDelegate = delegate(this.host(), 'activityFeed');

    const items = await activityDelegate.findMany({
      where: {
        userId,
        metadata: { path: ['libraryId'], equals: libraryId },
      },
      orderBy: { createdAt: 'desc' },
    });

    return asRows<Record<string, unknown>>(items);
  }
}
