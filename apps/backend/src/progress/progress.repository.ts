import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { asHost, delegate, type QueryableDelegate } from '../common/prisma-delegates';
import type { MediaTotals } from './progress-calculation.service';

interface ProgressModelConfig {
  userDelegate: string;
  mediaDelegate: string;
  mediaIdField: string;
}

export interface LibraryItemWithMedia {
  id: string;
  userId: string;
  _mediaType?: string;
  movieId?: string;
  tvShowId?: string;
  animeId?: string;
  bookId?: string;
  gameId?: string;
  musicAlbumId?: string;
  podcastId?: string;
  courseId?: string;
  progress?: number | null;
  progressPercentage?: number | null;
  currentEpisode?: number | null;
  currentSeason?: number | null;
  currentChapter?: number | null;
  currentPage?: number | null;
  currentTrack?: number | null;
  currentLesson?: number | null;
  currentModule?: number | null;
  hoursSpent?: number | null;
  minutesSpent?: number | null;
  status?: string;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  lastInteractionAt?: Date | null;
  updatedAt?: Date;
  [key: string]: Prisma.InputJsonValue | string | boolean | number | Date | null | undefined;
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

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private lib(delegateName: string): QueryableDelegate {
    return delegate(this.host(), delegateName);
  }

  async findLibraryItem(id: string, type: string): Promise<LibraryItemWithMedia | null> {
    const cfg = this.getCfg(type);
    if (!cfg) return null;
    const del = this.lib(cfg.userDelegate);
    const item = await del.findUnique({ where: { id } });
    return (item as LibraryItemWithMedia) ?? null;
  }

  async fetchMediaTotals(type: string, mediaId: string): Promise<MediaTotals> {
    const cfg = this.getCfg(type);
    if (!cfg) return emptyTotals();
    const del = this.lib(cfg.mediaDelegate);

    const media = await del.findUnique({ where: { id: mediaId } });
    if (!media) return emptyTotals();

    const m = media as Record<string, unknown>;
    return {
      runtime: (m.runtime as number | null) ?? null,
      totalEpisodes: (m.totalEpisodes as number | null) ?? null,
      totalSeasons: (m.totalSeasons as number | null) ?? null,
      pageCount: (m.pageCount as number | null) ?? null,
      totalTracks: (m.totalTracks as number | null) ?? null,
      totalModules: (m.totalModules as number | null) ?? null,
      totalLessons: (m.totalLessons as number | null) ?? null,
    };
  }

  async updateProgress(
    id: string,
    type: string,
    userId: string,
    data: Record<string, unknown>,
  ): Promise<LibraryItemWithMedia | null> {
    const cfg = this.getCfg(type);
    if (!cfg) return null;

    const del = this.lib(cfg.userDelegate);

    const updateData = { ...data, updatedAt: new Date(), lastInteractionAt: new Date() };

    const result = await del.updateMany({ where: { id, userId }, data: updateData });
    if (result.count === 0) return null;

    const updated = await del.findUnique({
      where: { id },
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
    return (updated as LibraryItemWithMedia) ?? null;
  }

  async findRecentByUserId(userId: string, limit = 20): Promise<LibraryItemWithMedia[]> {
    const results: LibraryItemWithMedia[] = [];

    for (const [type, cfg] of Object.entries(this.config)) {
      const del = this.lib(cfg.userDelegate);

      const items = await del.findMany({
        where: { userId, deletedAt: null },
        orderBy: { lastInteractionAt: 'desc' as const },
        take: limit,
        include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
      });

      for (const item of items) {
        results.push({ ...(item as LibraryItemWithMedia), _mediaType: type });
      }
    }

    results.sort((a, b) => {
      const aTime = a.lastInteractionAt?.getTime() ?? a.updatedAt?.getTime() ?? 0;
      const bTime = b.lastInteractionAt?.getTime() ?? b.updatedAt?.getTime() ?? 0;
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
