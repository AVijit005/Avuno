/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getLibraryTypes } from '../library';

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
  metadata: Record<string, any> | null;
  status: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  lastInteractionAt: Date | null;
  progress: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  [key: string]: any;
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

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  async findLibraryItem(id: string, type: string): Promise<LibraryItemWithMetadata | null> {
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    const delegate = this.prismaAny()[cfg.userDelegate];
    if (!delegate) return null;
    const item = await delegate.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
    return (item as LibraryItemWithMetadata) ?? null;
  }

  async updateLibraryItem(
    id: string,
    type: string,
    userId: string,
    data: Record<string, any>,
  ): Promise<LibraryItemWithMetadata | null> {
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    const delegate = this.prismaAny()[cfg.userDelegate];
    if (!delegate) return null;

    // Ownership is folded into the write predicate rather than checked by a
    // preceding read, closing the check-then-act window and removing a query.
    // The row is re-read afterwards because updateMany cannot return it with
    // the joined media.
    const updateData = { ...data, updatedAt: new Date(), lastInteractionAt: new Date() };

    const result = await delegate.updateMany({ where: { id, userId }, data: updateData });
    if (result.count === 0) return null;

    const updated = await delegate.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
    return updated as LibraryItemWithMetadata;
  }

  async recordHistory(
    userId: string,
    eventType: string,
    libraryId: string,
    mediaType: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const activityDelegate = this.prismaAny()['activityFeed'];
    if (!activityDelegate) return;

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
        metadata: { ...metadata, libraryId, mediaType, eventType },
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
      const delegate = this.prismaAny()[cfg.userDelegate];
      if (!delegate) continue;

      const where: Record<string, any> = { userId, favorite: true, deletedAt: null };
      if (cursor) {
        where.updatedAt = { lt: cursor };
      }

      const items = await delegate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...item, _mediaType: t });
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
      const delegate = this.prismaAny()[cfg.userDelegate];
      if (!delegate) continue;

      const where: Record<string, any> = {
        userId,
        deletedAt: null,
        bookmarked: true,
      };
      if (cursor) {
        where.updatedAt = { lt: cursor };
      }

      const items = await delegate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...item, _mediaType: t });
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
      const delegate = this.prismaAny()[cfg.userDelegate];
      if (!delegate) continue;

      const where: Record<string, any> = {
        userId,
        deletedAt: null,
        metadata: { path: ['review'], not: null },
      };
      if (cursor) {
        where.updatedAt = { lt: cursor };
      }

      const items = await delegate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...item, _mediaType: t });
      }
    }

    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return results.slice(0, limit + 1);
  }

  async findHistory(userId: string, type?: string, cursor?: string, limit = 20): Promise<Record<string, any>[]> {
    const activityDelegate = this.prismaAny()['activityFeed'];
    if (!activityDelegate) return [];

    const where: Record<string, any> = { userId };
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

    return items;
  }

  async findHistoryByLibraryItem(
    userId: string,
    libraryId: string,
    _mediaType: string,
  ): Promise<Record<string, any>[]> {
    const activityDelegate = this.prismaAny()['activityFeed'];
    if (!activityDelegate) return [];

    const items = await activityDelegate.findMany({
      where: {
        userId,
        metadata: { path: ['libraryId'], equals: libraryId },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }
}
