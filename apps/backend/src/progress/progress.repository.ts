/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MediaTotals } from './progress-calculation.service';

interface ProgressModelConfig {
  userDelegate: string;
  mediaDelegate: string;
  mediaIdField: string;
}

@Injectable()
export class ProgressRepository {
  private readonly config: Record<string, ProgressModelConfig>;

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

  private getCfg(type: string): ProgressModelConfig | null {
    return this.config[type] ?? null;
  }

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  async findLibraryItem(id: string, type: string): Promise<Record<string, any> | null> {
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    const delegate = this.prismaAny()[cfg.userDelegate];
    if (!delegate) return null;
    return delegate.findUnique({ where: { id } }) ?? null;
  }

  async fetchMediaTotals(type: string, mediaId: string): Promise<MediaTotals> {
    const cfg = this.getCfg(type);
    if (!cfg) return emptyTotals();
    const delegate = this.prismaAny()[cfg.mediaDelegate];
    if (!delegate) return emptyTotals();

    const media = await delegate.findUnique({ where: { id: mediaId } });
    if (!media) return emptyTotals();

    return {
      runtime: media.runtime ?? null,
      totalEpisodes: media.totalEpisodes ?? null,
      totalSeasons: media.totalSeasons ?? null,
      pageCount: media.pageCount ?? null,
      totalTracks: media.totalTracks ?? null,
      totalModules: media.totalModules ?? null,
      totalLessons: media.totalLessons ?? null,
    };
  }

  async updateProgress(
    id: string,
    type: string,
    userId: string,
    data: Record<string, any>,
  ): Promise<Record<string, any> | null> {
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

    return delegate.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
  }

  async findRecentByUserId(userId: string, limit = 20): Promise<Record<string, any>[]> {
    const results: Record<string, any>[] = [];

    for (const [type, cfg] of Object.entries(this.config)) {
      const delegate = this.prismaAny()[cfg.userDelegate];
      if (!delegate) continue;

      const items = await delegate.findMany({
        where: { userId, deletedAt: null },
        orderBy: { lastInteractionAt: 'desc' as const },
        take: limit,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...item, _mediaType: type });
      }
    }

    results.sort((a, b) => {
      const aTime = a.lastInteractionAt?.getTime() ?? a.updatedAt.getTime();
      const bTime = b.lastInteractionAt?.getTime() ?? b.updatedAt.getTime();
      return bTime - aTime;
    });

    return results.slice(0, limit);
  }
}

function emptyTotals(): MediaTotals {
  return {
    runtime: null,
    totalEpisodes: null,
    totalSeasons: null,
    pageCount: null,
    totalTracks: null,
    totalModules: null,
    totalLessons: null,
  };
}
