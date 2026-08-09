/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MediaDelegate {
  mediaIdField: string;
  mediaDelegate: string;
}

const MEDIA_CONFIG: Record<string, MediaDelegate> = {
  movie: { mediaIdField: 'movieId', mediaDelegate: 'movie' },
  tvShow: { mediaIdField: 'tvShowId', mediaDelegate: 'tvShow' },
  anime: { mediaIdField: 'animeId', mediaDelegate: 'anime' },
  book: { mediaIdField: 'bookId', mediaDelegate: 'book' },
  game: { mediaIdField: 'gameId', mediaDelegate: 'game' },
  musicAlbum: { mediaIdField: 'musicAlbumId', mediaDelegate: 'musicAlbum' },
  podcast: { mediaIdField: 'podcastId', mediaDelegate: 'podcast' },
  course: { mediaIdField: 'courseId', mediaDelegate: 'course' },
};

@Injectable()
export class CollectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  // ─── Collections ───────────────────────────────────────────────────────────

  async createCollection(data: {
    userId: string;
    name: string;
    description?: string;
    visibility?: string;
    isPinned?: boolean;
    isSmartCollection?: boolean;
    icon?: string;
    color?: string;
  }): Promise<Record<string, any>> {
    const slug = this.generateSlug(data.name);
    const result = await this.prismaAny().collection.create({
      data: {
        userId: data.userId,
        name: data.name,
        slug,
        description: data.description ?? null,
        visibility: data.visibility ?? 'PRIVATE',
        isPinned: data.isPinned ?? false,
        isSmartCollection: data.isSmartCollection ?? false,
        icon: data.icon ?? null,
        color: data.color ?? null,
      },
    });
    return result;
  }

  async findCollectionById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const where: Record<string, any> = { id };
    if (userId) where.userId = userId;

    const collection = await this.prismaAny().collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            movie: { select: { id: true, slug: true, title: true, posterUrl: true } },
            tvShow: { select: { id: true, slug: true, title: true, posterUrl: true } },
            anime: { select: { id: true, slug: true, title: true, posterUrl: true } },
            book: { select: { id: true, slug: true, title: true, posterUrl: true } },
            game: { select: { id: true, slug: true, title: true, posterUrl: true } },
            musicAlbum: { select: { id: true, slug: true, title: true, posterUrl: true } },
            podcast: { select: { id: true, slug: true, title: true, posterUrl: true } },
            course: { select: { id: true, slug: true, title: true, posterUrl: true } },
          },
        },
      },
    });

    if (!collection || (userId && collection.userId !== userId)) return null;
    return collection;
  }

  async findCollectionsByUserId(userId: string, visibility?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (visibility) where.visibility = visibility;

    return this.prismaAny().collection.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { items: true } } },
    });
  }

  async updateCollection(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;

    const updateData: Record<string, any> = { ...data, updatedAt: new Date() };
    if (data.name) updateData.slug = this.generateSlug(data.name);

    return this.prismaAny().collection.update({
      where: { id },
      data: updateData,
    });
  }

  async softDeleteCollection(id: string, userId: string): Promise<boolean> {
    // Collection model doesn't have deletedAt. Use hard delete.
    const existing = await this.prismaAny().collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;

    await this.prisma.$transaction([
      this.prismaAny().collectionItem.deleteMany({ where: { collectionId: id } }),
      this.prismaAny().collection.delete({ where: { id } }),
    ]);
    return true;
  }

  async collectionExists(userId: string, slug: string): Promise<boolean> {
    const count = await this.prismaAny().collection.count({
      where: { userId, slug },
    });
    return count > 0;
  }

  // ─── Collection Items ──────────────────────────────────────────────────────

  async addItem(
    collectionId: string,
    userId: string,
    mediaType: string,
    mediaId: string,
    note?: string,
  ): Promise<Record<string, any> | null> {
    const cfg = MEDIA_CONFIG[mediaType];
    if (!cfg) return null;

    const collection = await this.prismaAny().collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) return null;

    // Get max position
    const maxItem = await this.prismaAny().collectionItem.findFirst({
      where: { collectionId },
      orderBy: { position: 'desc' },
    });
    const nextPosition = (maxItem?.position ?? -1) + 1;

    try {
      const item = await this.prismaAny().collectionItem.create({
        data: {
          collectionId,
          [cfg.mediaIdField]: mediaId,
          position: nextPosition,
          note: note ?? null,
        },
        include: {
          [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } },
        },
      });
      return item;
    } catch {
      // Unique constraint violation (duplicate item)
      return null;
    }
  }

  async removeItem(itemId: string, collectionId: string, userId: string): Promise<boolean> {
    const collection = await this.prismaAny().collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) return false;

    const item = await this.prismaAny().collectionItem.findUnique({ where: { id: itemId } });
    if (!item || item.collectionId !== collectionId) return false;

    await this.prismaAny().collectionItem.delete({ where: { id: itemId } });
    return true;
  }

  async reorderItems(collectionId: string, userId: string, itemIds: string[]): Promise<boolean> {
    const collection = await this.prismaAny().collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) return false;

    // Scope every write to this collection.
    //
    // Ownership was previously verified on the container only, while the
    // updates ran with `where: { id: itemId }` — no collectionId. Any
    // authenticated user could therefore reorder items belonging to another
    // user's collection simply by listing their item IDs, rewriting `position`
    // across the table and scrambling other people's curated ordering.
    //
    // Verify membership before writing anything, inside the same interactive
    // transaction, so a batch containing a foreign ID is rejected outright
    // rather than partially applied.
    return this.prisma.$transaction(async (tx) => {
      // Narrow structural type instead of `any`: only these two operations
      // are used, and typing them keeps the query shapes checked.
      const txAny = tx as unknown as {
        collectionItem: {
          findMany(args: {
            where: { id: { in: string[] }; collectionId: string };
            select: { id: true };
          }): Promise<{ id: string }[]>;
          update(args: { where: { id: string }; data: { position: number } }): Promise<unknown>;
        };
      };

      const owned = await txAny.collectionItem.findMany({
        where: { id: { in: itemIds }, collectionId },
        select: { id: true },
      });

      if (owned.length !== itemIds.length) return false;

      for (const [i, itemId] of itemIds.entries()) {
        await txAny.collectionItem.update({
          where: { id: itemId },
          data: { position: i },
        });
      }

      return true;
    });
  }

  // ─── Shelves ───────────────────────────────────────────────────────────────

  async createShelf(data: {
    userId: string;
    title: string;
    description?: string;
    visibility?: string;
    isPinned?: boolean;
    icon?: string;
    color?: string;
  }): Promise<Record<string, any>> {
    const slug = this.generateSlug(data.title);
    return this.prismaAny().shelf.create({
      data: {
        userId: data.userId,
        title: data.title,
        slug,
        description: data.description ?? null,
        visibility: data.visibility ?? 'PRIVATE',
        isPinned: data.isPinned ?? false,
        icon: data.icon ?? null,
        color: data.color ?? null,
      },
    });
  }

  async findShelfById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const shelf = await this.prismaAny().shelf.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            movie: { select: { id: true, slug: true, title: true, posterUrl: true } },
            tvShow: { select: { id: true, slug: true, title: true, posterUrl: true } },
            anime: { select: { id: true, slug: true, title: true, posterUrl: true } },
            book: { select: { id: true, slug: true, title: true, posterUrl: true } },
            game: { select: { id: true, slug: true, title: true, posterUrl: true } },
            musicAlbum: { select: { id: true, slug: true, title: true, posterUrl: true } },
            podcast: { select: { id: true, slug: true, title: true, posterUrl: true } },
            course: { select: { id: true, slug: true, title: true, posterUrl: true } },
          },
        },
      },
    });
    if (!shelf || (userId && shelf.userId !== userId)) return null;
    return shelf;
  }

  async findShelvesByUserId(userId: string, visibility?: string): Promise<Record<string, any>[]> {
    const where: Record<string, any> = { userId };
    if (visibility) where.visibility = visibility;

    return this.prismaAny().shelf.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { items: true } } },
    });
  }

  async updateShelf(id: string, userId: string, data: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.prismaAny().shelf.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return null;

    const updateData: Record<string, any> = { ...data, updatedAt: new Date() };
    if (data.title) updateData.slug = this.generateSlug(data.title);

    return this.prismaAny().shelf.update({ where: { id }, data: updateData });
  }

  async softDeleteShelf(id: string, userId: string): Promise<boolean> {
    const existing = await this.prismaAny().shelf.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return false;

    await this.prisma.$transaction([
      this.prismaAny().shelfItem.deleteMany({ where: { shelfId: id } }),
      this.prismaAny().shelf.delete({ where: { id } }),
    ]);
    return true;
  }

  async shelfExists(userId: string, slug: string): Promise<boolean> {
    const count = await this.prismaAny().shelf.count({
      where: { userId, slug },
    });
    return count > 0;
  }

  // ─── Library Queries (for smart collections & stats) ───────────────────────

  async findLibraryItems(userId: string, filters: Record<string, any>, limit = 100): Promise<Record<string, any>[]> {
    const results: Record<string, any>[] = [];
    const mediaConfig = {
      movie: 'userMovie',
      tvShow: 'userTvShow',
      anime: 'userAnime',
      book: 'userBook',
      game: 'userGame',
      musicAlbum: 'userMusicAlbum',
      podcast: 'userPodcast',
      course: 'userCourse',
    };

    for (const [type, delegateName] of Object.entries(mediaConfig)) {
      const delegate = this.prismaAny()[delegateName];
      if (!delegate) continue;

      const where: Record<string, any> = { userId, deletedAt: null };

      if (filters.status) where.status = filters.status;
      if (filters.rating !== undefined) {
        if (filters.ratingOperator === 'gte') where.rating = { gte: filters.rating };
        else if (filters.ratingOperator === 'lte') where.rating = { lte: filters.rating };
        else if (filters.ratingOperator === 'gt') where.rating = { gt: filters.rating };
        else if (filters.ratingOperator === 'lt') where.rating = { lt: filters.rating };
        else where.rating = filters.rating;
      }
      if (filters.favorite !== undefined) where.favorite = filters.favorite;

      const items = await delegate.findMany({
        where,
        take: limit,
        include: { [type]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...item, _mediaType: type });
      }
    }

    return results;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200) || 'untitled'
    );
  }
}
