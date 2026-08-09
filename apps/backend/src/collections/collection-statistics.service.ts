import { Injectable } from '@nestjs/common';
import { CollectionsRepository } from './collections.repository';
import type { CollectionStatsDto } from './dto';
import { asHost, delegate } from '../common/prisma-delegates';

@Injectable()
export class CollectionStatisticsService {
  constructor(private readonly repository: CollectionsRepository) {}

  async getCollectionStats(userId: string, collectionId: string): Promise<CollectionStatsDto> {
    const collection = await this.repository.findCollectionById(collectionId, userId);
    if (!collection) {
      return {
        totalItems: 0,
        completed: 0,
        favoriteCount: 0,
        completionPercent: 0,
        mediaTypeBreakdown: {},
      };
    }

    const items = collection.items ?? [];
    const totalItems = items.length;
    const mediaTypeBreakdown: Record<string, number> = {};
    let completed = 0;
    let favoriteCount = 0;

    // Collect all media IDs by type to look up in user library
    const mediaIdsByType: Record<string, string[]> = {};
    for (const item of items) {
      for (const [type, cfg] of Object.entries(MEDIA_TYPE_MAP)) {
        const mediaId = item[cfg.field];
        if (mediaId) {
          if (!mediaIdsByType[type]) mediaIdsByType[type] = [];
          mediaIdsByType[type].push(mediaId);
          mediaTypeBreakdown[type] = (mediaTypeBreakdown[type] ?? 0) + 1;
          break;
        }
      }
    }

    // Look up library status for each media
    for (const [type, ids] of Object.entries(mediaIdsByType)) {
      const cfg = MEDIA_TYPE_MAP[type];
      if (!cfg) continue;

      const prisma = (this.repository as unknown as { prisma: Record<string, unknown> }).prisma;
      const del = delegate(asHost(prisma), cfg.userDelegate);

      const userItems = await del.findMany({
        where: { userId, [cfg.mediaIdField]: { in: ids }, deletedAt: null },
      });

      for (const userItem of userItems) {
        const item = userItem as { status: string; favorite: boolean };
        if (item.status === 'COMPLETED') completed++;
        if (item.favorite) favoriteCount++;
      }
    }

    return {
      totalItems,
      completed,
      favoriteCount,
      completionPercent: totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0,
      mediaTypeBreakdown,
    };
  }
}

const MEDIA_TYPE_MAP: Record<string, { field: string; userDelegate: string; mediaIdField: string }> = {
  movie: { field: 'movieId', userDelegate: 'userMovie', mediaIdField: 'movieId' },
  tvShow: { field: 'tvShowId', userDelegate: 'userTvShow', mediaIdField: 'tvShowId' },
  anime: { field: 'animeId', userDelegate: 'userAnime', mediaIdField: 'animeId' },
  book: { field: 'bookId', userDelegate: 'userBook', mediaIdField: 'bookId' },
  game: { field: 'gameId', userDelegate: 'userGame', mediaIdField: 'gameId' },
  musicAlbum: { field: 'musicAlbumId', userDelegate: 'userMusicAlbum', mediaIdField: 'musicAlbumId' },
  podcast: { field: 'podcastId', userDelegate: 'userPodcast', mediaIdField: 'podcastId' },
  course: { field: 'courseId', userDelegate: 'userCourse', mediaIdField: 'courseId' },
};
