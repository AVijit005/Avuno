/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LibraryModelConfig {
  delegate: string;
  mediaIdField: string;
  includeKey: string;
}

export interface LibraryRow {
  id: string;
  userId: string;
  status: string;
  rating: number | null;
  rewatchCount: number | null;
  favorite: boolean;
  hidden: boolean;
  private: boolean;
  notes: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  lastInteractionAt: Date | null;
  progress: number | null;
  progressPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
  media?: Record<string, any> | null;
}

export interface LibraryFindManyParams {
  status?: string;
  favorite?: boolean;
  hidden?: boolean;
  private?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
  limit: number;
}

const LIBRARY_TYPES = ['movie', 'tvShow', 'anime', 'book', 'game', 'musicAlbum', 'podcast', 'course'] as const;

export type LibraryMediaType = (typeof LIBRARY_TYPES)[number];

export function isValidLibraryType(value: string): value is LibraryMediaType {
  return LIBRARY_TYPES.includes(value as LibraryMediaType);
}

export function getLibraryTypes(): readonly LibraryMediaType[] {
  return LIBRARY_TYPES;
}

@Injectable()
export class LibraryRepository {
  private readonly modelConfig: Record<string, LibraryModelConfig>;

  constructor(private readonly prisma: PrismaService) {
    this.modelConfig = {
      movie: { delegate: 'userMovie', mediaIdField: 'movieId', includeKey: 'movie' },
      tvShow: { delegate: 'userTvShow', mediaIdField: 'tvShowId', includeKey: 'tvShow' },
      anime: { delegate: 'userAnime', mediaIdField: 'animeId', includeKey: 'anime' },
      book: { delegate: 'userBook', mediaIdField: 'bookId', includeKey: 'book' },
      game: { delegate: 'userGame', mediaIdField: 'gameId', includeKey: 'game' },
      musicAlbum: { delegate: 'userMusicAlbum', mediaIdField: 'musicAlbumId', includeKey: 'musicAlbum' },
      podcast: { delegate: 'userPodcast', mediaIdField: 'podcastId', includeKey: 'podcast' },
      course: { delegate: 'userCourse', mediaIdField: 'courseId', includeKey: 'course' },
    };
  }

  getConfig(type: string): LibraryModelConfig | null {
    return this.modelConfig[type] ?? null;
  }

  getTypes(): string[] {
    return Object.keys(this.modelConfig);
  }

  private getDelegate(type: string): any {
    const cfg = this.modelConfig[type];
    if (!cfg) return null;
    const prismaAny = this.prisma as unknown as Record<string, any>;
    return prismaAny[cfg.delegate] ?? null;
  }

  async findByUserIdAndMediaId(userId: string, type: string, mediaId: string): Promise<LibraryRow | null> {
    const delegate = this.getDelegate(type);
    const cfg = this.modelConfig[type];
    if (!delegate || !cfg) return null;

    const item = await delegate.findUnique({
      where: {
        userId_mediaId: { userId, [cfg.mediaIdField]: mediaId } as any,
      },
    });

    if (!item || item.deletedAt) return null;

    return (item as LibraryRow) ?? null;
  }

  async findById(id: string, userId: string, type?: string): Promise<LibraryRow | null> {
    if (type) {
      const delegate = this.getDelegate(type);
      if (!delegate) return null;
      const cfg = this.modelConfig[type];
      const item = await delegate.findUnique({
        where: { id },
        include: cfg
          ? {
              [cfg.includeKey]: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  posterUrl: true,
                  backdropUrl: true,
                  releaseYear: true,
                  genres: true,
                },
              },
            }
          : undefined,
      });
      if (!item || item.userId !== userId || item.deletedAt) return null;
      return item as LibraryRow;
    }

    for (const t of this.getTypes()) {
      const delegate = this.getDelegate(t);
      if (!delegate) continue;
      const cfg = this.modelConfig[t];
      const item = await delegate.findUnique({
        where: { id },
        include: cfg
          ? {
              [cfg.includeKey]: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  posterUrl: true,
                  backdropUrl: true,
                  releaseYear: true,
                  genres: true,
                },
              },
            }
          : undefined,
      });
      if (item && item.userId === userId && !item.deletedAt) return item as LibraryRow;
    }
    return null;
  }

  async findAll(userId: string, type: string | undefined, params: LibraryFindManyParams): Promise<LibraryRow[]> {
    if (type) {
      const delegate = this.getDelegate(type);
      if (!delegate) return [];
      return this.executeFindAll(delegate, userId, type, params);
    }

    const promises = this.getTypes().map(t => {
      const delegate = this.getDelegate(t);
      if (!delegate) return Promise.resolve([]);
      return this.executeFindAll(delegate, userId, t, params);
    });
    const results = await Promise.all(promises);
    const all = results.flat();
    const sortField = params.sortBy ?? 'createdAt';
    const sortOrder = params.sortOrder ?? 'desc';
    all.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
    return all.slice(0, params.limit);
  }

  private buildWhere(userId: string, params: LibraryFindManyParams): Record<string, unknown> {
    const where: Record<string, unknown> = { userId, deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.favorite !== undefined) where.favorite = params.favorite;
    if (params.hidden !== undefined) where.hidden = params.hidden;
    if (params.private !== undefined) where.private = params.private;
    return where;
  }

  private buildOrderBy(params: LibraryFindManyParams): Record<string, string>[] {
    const sortField = params.sortBy ?? 'createdAt';
    const sortOrder = params.sortOrder ?? 'desc';
    return [{ [sortField]: sortOrder }, { id: 'asc' }];
  }

  private async executeFindAll(
    delegate: any,
    userId: string,
    type: string,
    params: LibraryFindManyParams,
  ): Promise<LibraryRow[]> {
    const where = this.buildWhere(userId, params);
    const orderBy = this.buildOrderBy(params);
    const cfg = this.modelConfig[type];

    const query: Record<string, unknown> = {
      where,
      orderBy,
      take: params.limit,
    };

    if (cfg) {
      query.include = {
        [cfg.includeKey]: {
          select: {
            id: true,
            slug: true,
            title: true,
            posterUrl: true,
            backdropUrl: true,
            releaseYear: true,
            genres: true,
          },
        },
      };
    }

    if (params.cursor) {
      query.skip = 1;
      query.cursor = { id: params.cursor };
    }

    return delegate.findMany(query as any) as Promise<LibraryRow[]>;
  }

  async create(
    type: string,
    data: {
      userId: string;
      mediaId: string;
      status?: string;
      startedAt?: Date;
    },
  ): Promise<LibraryRow> {
    const delegate = this.getDelegate(type);
    const cfg = this.modelConfig[type];
    if (!delegate || !cfg) throw new Error(`Invalid media type: ${type}`);

    const createData: Record<string, unknown> = {
      userId: data.userId,
      [cfg.mediaIdField]: data.mediaId,
      status: data.status ?? 'PLANNING',
    };
    if (data.startedAt) createData.startedAt = data.startedAt;

    const item = await delegate.create({
      data: createData as any,
      include: {
        [cfg.includeKey]: {
          select: {
            id: true,
            slug: true,
            title: true,
            posterUrl: true,
            backdropUrl: true,
            releaseYear: true,
            genres: true,
          },
        },
      } as any,
    });

    return item as LibraryRow;
  }

  async update(id: string, userId: string, type: string, data: Record<string, unknown>): Promise<LibraryRow | null> {
    const delegate = this.getDelegate(type);
    const cfg = this.modelConfig[type];
    if (!delegate || !cfg) return null;

    const existing = await delegate.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId || existing.deletedAt) return null;

    const updateData = { ...data, updatedAt: new Date() };

    const item = await delegate.update({
      where: { id },
      data: updateData as any,
      include: {
        [cfg.includeKey]: {
          select: {
            id: true,
            slug: true,
            title: true,
            posterUrl: true,
            backdropUrl: true,
            releaseYear: true,
            genres: true,
          },
        },
      } as any,
    });

    return item as LibraryRow;
  }

  async softDelete(id: string, userId: string, type: string): Promise<boolean> {
    const delegate = this.getDelegate(type);
    if (!delegate) return false;

    const existing = await delegate.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId || existing.deletedAt) return false;

    await delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async countByStatus(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    
    const promises = this.getTypes().map(async (t) => {
      const delegate = this.getDelegate(t);
      if (!delegate) return [];
      return delegate.groupBy({
        by: ['status'],
        where: { userId, deletedAt: null } as any,
        _count: { status: true },
      });
    });

    const results = await Promise.all(promises);
    for (const groupResults of results) {
      for (const group of groupResults) {
        counts[group.status] = (counts[group.status] ?? 0) + group._count.status;
      }
    }

    return counts;
  }

  async countByType(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const t of this.getTypes()) {
      const delegate = this.getDelegate(t);
      if (!delegate) continue;
      counts[t] = await delegate.count({ where: { userId, deletedAt: null } as any });
    }
    return counts;
  }

  async countFavorites(userId: string): Promise<number> {
    let total = 0;
    for (const t of this.getTypes()) {
      const delegate = this.getDelegate(t);
      if (!delegate) continue;
      total += await delegate.count({ where: { userId, favorite: true, deletedAt: null } as any });
    }
    return total;
  }

  async verifyMediaExists(type: string, mediaId: string): Promise<boolean> {
    const prismaAny = this.prisma as unknown as Record<string, any>;
    const mediaDelegate = prismaAny[type];
    if (!mediaDelegate) return false;
    const item = await mediaDelegate.findUnique({ where: { id: mediaId } });
    return !!item && !item.deletedAt;
  }
}
