/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserLibConfig {
  delegate: string;
  mediaDelegate: string;
  mediaIdField: string;
  type: string;
}

const USER_LIB_TYPES: UserLibConfig[] = [
  { delegate: 'userMovie', mediaDelegate: 'movie', mediaIdField: 'movieId', type: 'movie' },
  { delegate: 'userTvShow', mediaDelegate: 'tvShow', mediaIdField: 'tvShowId', type: 'tvShow' },
  { delegate: 'userAnime', mediaDelegate: 'anime', mediaIdField: 'animeId', type: 'anime' },
  { delegate: 'userBook', mediaDelegate: 'book', mediaIdField: 'bookId', type: 'book' },
  { delegate: 'userGame', mediaDelegate: 'game', mediaIdField: 'gameId', type: 'game' },
  { delegate: 'userMusicAlbum', mediaDelegate: 'musicAlbum', mediaIdField: 'musicAlbumId', type: 'musicAlbum' },
  { delegate: 'userPodcast', mediaDelegate: 'podcast', mediaIdField: 'podcastId', type: 'podcast' },
  { delegate: 'userCourse', mediaDelegate: 'course', mediaIdField: 'courseId', type: 'course' },
];

const _MEDIA_DELEGATES = ['movie', 'tvShow', 'anime', 'book', 'game', 'musicAlbum', 'podcast', 'course'];

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  // ─── Library Stats ────────────────────────────────────────────────────────

  async countByStatus(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const promises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return [];
      return delegate.groupBy({
        by: ['status'],
        where: { userId, deletedAt: null },
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

  async countCompletedByType(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const results = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return { type: cfg.type, count: 0 };
        const count = await delegate.count({
          where: { userId, status: 'COMPLETED', deletedAt: null },
        });
        return { type: cfg.type, count };
      })
    );
    for (const r of results) {
      if (r.count > 0) counts[r.type] = r.count;
    }
    return counts;
  }

  async countTotalByType(userId: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const results = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return { type: cfg.type, count: 0 };
        const count = await delegate.count({
          where: { userId, deletedAt: null },
        });
        return { type: cfg.type, count };
      })
    );
    for (const r of results) {
      if (r.count > 0) counts[r.type] = r.count;
    }
    return counts;
  }

  async getHoursAndEpisodesByType(userId: string): Promise<{ hours: Record<string, number>, episodes: number }> {
    const hours: Record<string, number> = {};
    let episodes = 0;
    const results = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return { type: cfg.type, h: 0, ep: 0 };
        const items = await delegate.findMany({
          where: { userId, deletedAt: null },
          select: { hoursSpent: true, minutesSpent: true, currentEpisode: true },
        });
        let h = 0;
        let ep = 0;
        for (const item of items) {
          h += (item.hoursSpent ?? 0) + (item.minutesSpent ?? 0) / 60;
          if (item.currentEpisode) ep += item.currentEpisode;
        }
        return { type: cfg.type, h, ep };
      })
    );
    for (const r of results) {
      hours[r.type] = r.h;
      episodes += r.ep;
    }
    return { hours, episodes };
  }

  async getTotalLibraryItems(userId: string): Promise<number> {
    const counts = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return 0;
        return delegate.count({ where: { userId, deletedAt: null } });
      })
    );
    return counts.reduce((sum, c) => sum + c, 0);
  }

  async getProgressDistribution(userId: string): Promise<Record<string, number>> {
    const dist: Record<string, number> = {};
    const promises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return [];
      return delegate.groupBy({
        by: ['progressPercentage'],
        where: { userId, deletedAt: null },
        _count: { progressPercentage: true },
      });
    });

    const results = await Promise.all(promises);
    for (const groupResults of results) {
      for (const group of groupResults) {
        if (group.progressPercentage === null) continue;
        const pct = group.progressPercentage;
        const count = group._count.progressPercentage;
        
        if (pct === 0) dist['0'] = (dist['0'] ?? 0) + count;
        else if (pct <= 25) dist['1-25'] = (dist['1-25'] ?? 0) + count;
        else if (pct <= 50) dist['26-50'] = (dist['26-50'] ?? 0) + count;
        else if (pct <= 75) dist['51-75'] = (dist['51-75'] ?? 0) + count;
        else if (pct < 100) dist['76-99'] = (dist['76-99'] ?? 0) + count;
        else dist['100'] = (dist['100'] ?? 0) + count;
      }
    }
    return dist;
  }

  async getRatingsDistribution(userId: string): Promise<Record<string, number>> {
    const dist: Record<string, number> = {};
    const promises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return [];
      return delegate.groupBy({
        by: ['rating'],
        where: { userId, rating: { not: null }, deletedAt: null },
        _count: { rating: true },
      });
    });

    const results = await Promise.all(promises);
    for (const groupResults of results) {
      for (const group of groupResults) {
        if (group.rating !== null) {
          const key = `${group.rating}`;
          dist[key] = (dist[key] ?? 0) + group._count.rating;
        }
      }
    }
    return dist;
  }

  async getAverageRating(userId: string): Promise<number | null> {
    let totalSum = 0;
    let totalCount = 0;

    const promises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return null;
      return delegate.aggregate({
        where: { userId, rating: { not: null }, deletedAt: null },
        _sum: { rating: true },
        _count: { rating: true },
      });
    });

    const results = await Promise.all(promises);
    for (const agg of results) {
      if (agg && agg._count.rating > 0) {
        totalSum += agg._sum.rating ?? 0;
        totalCount += agg._count.rating;
      }
    }

    return totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : null;
  }

  async getFavoriteCount(userId: string): Promise<number> {
    const counts = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return 0;
        return delegate.count({ where: { userId, favorite: true, deletedAt: null } });
      })
    );
    return counts.reduce((sum, c) => sum + c, 0);
  }

  async getReviewCount(userId: string): Promise<number> {
    const counts = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return 0;
        const items = await delegate.findMany({
          where: { userId, deletedAt: null },
          select: { metadata: true },
        });
        let count = 0;
        for (const item of items) {
          const meta = item.metadata as Record<string, any> | null;
          if (meta?.review) count++;
        }
        return count;
      })
    );
    return counts.reduce((sum, c) => sum + c, 0);
  }

  async getBookmarkCount(userId: string): Promise<number> {
    const counts = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return 0;
        return delegate.count({ where: { userId, bookmarked: true, deletedAt: null } });
      })
    );
    return counts.reduce((sum, c) => sum + c, 0);
  }

  // ─── Continue Watching / Reading / Playing / Listening / Learning ──────────

  async getInProgressByType(userId: string, type: string, statuses: string[], limit = 10): Promise<any[]> {
    const cfg = USER_LIB_TYPES.find((c) => c.type === type);
    if (!cfg) return [];

    const delegate = this.prismaAny()[cfg.delegate];
    if (!delegate) return [];

    return delegate.findMany({
      where: {
        userId,
        status: { in: statuses },
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
    });
  }

  // ─── Recently Added / Completed ────────────────────────────────────────────

  async getRecentlyAdded(userId: string, limit = 10): Promise<any[]> {
    const allItems = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return [];
        const items = await delegate.findMany({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
        });
        return items.map((item: any) => ({ ...item, _mediaType: cfg.type }));
      })
    );
    const results = allItems.flat();
    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return results.slice(0, limit);
  }

  async getRecentlyCompleted(userId: string, limit = 10): Promise<any[]> {
    const allItems = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return [];
        const items = await delegate.findMany({
          where: { userId, status: 'COMPLETED', deletedAt: null },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          include: { [cfg.mediaDelegate]: { select: { id: true, slug: true, title: true, posterUrl: true } } },
        });
        return items.map((item: any) => ({ ...item, _mediaType: cfg.type }));
      })
    );
    const results = allItems.flat();
    results.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
    return results.slice(0, limit);
  }

  // ─── Pinned Collections ───────────────────────────────────────────────────

  async getPinnedCollections(userId: string): Promise<any[]> {
    const delegate = this.prismaAny().collection;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId, isPinned: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    });
  }

  // ─── Journal & Memories ───────────────────────────────────────────────────

  async getRecentJournalEntries(userId: string, limit = 5): Promise<any[]> {
    const delegate = this.prismaAny().journalEntry;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentMemories(userId: string, limit = 5): Promise<any[]> {
    const delegate = this.prismaAny().memory;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getJournalEntryDates(userId: string, limit = 365): Promise<Date[]> {
    const delegate = this.prismaAny().journalEntry;
    if (!delegate) return [];
    const items = await delegate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { createdAt: true },
    });
    return items.map((i: any) => i.createdAt);
  }

  // ─── Activity Heatmap ──────────────────────────────────────────────────────

  async getActivityData(userId: string, days = 365): Promise<Record<string, number>> {
    const heatmap: Record<string, number> = {};
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Run all queries in parallel: library items + journal + memories
    const libraryPromises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return [];
      return delegate.findMany({
        where: { userId, createdAt: { gte: startDate }, deletedAt: null },
        select: { createdAt: true },
      });
    });

    const journal = this.prismaAny().journalEntry;
    const journalPromise = journal
      ? journal.findMany({ where: { userId, createdAt: { gte: startDate } }, select: { createdAt: true } })
      : Promise.resolve([]);

    const memory = this.prismaAny().memory;
    const memoryPromise = memory
      ? memory.findMany({ where: { userId, createdAt: { gte: startDate } }, select: { createdAt: true } })
      : Promise.resolve([]);

    const [libraryResults, entries, mems] = await Promise.all([
      Promise.all(libraryPromises),
      journalPromise,
      memoryPromise,
    ]);

    for (const items of libraryResults) {
      for (const item of items) {
        const key = item.createdAt.toISOString().slice(0, 10);
        heatmap[key] = (heatmap[key] ?? 0) + 1;
      }
    }
    for (const e of entries) {
      const key = e.createdAt.toISOString().slice(0, 10);
      heatmap[key] = (heatmap[key] ?? 0) + 1;
    }
    for (const m of mems) {
      const key = m.createdAt.toISOString().slice(0, 10);
      heatmap[key] = (heatmap[key] ?? 0) + 1;
    }

    return heatmap;
  }

  // ─── Calendar ──────────────────────────────────────────────────────────────

  async getCalendarData(userId: string, year: number, month?: number): Promise<CalendarRawData> {
    const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
    const endDate = month ? new Date(year, month, 0, 23, 59, 59, 999) : new Date(year, 11, 31, 23, 59, 59, 999);

    const journalCounts: Record<string, number> = {};
    const memoryCounts: Record<string, number> = {};
    const completedCounts: Record<string, number> = {};
    const hoursTracked: Record<string, number> = {};

    const journal = this.prismaAny().journalEntry;
    const journalPromise = journal
      ? journal.findMany({ where: { userId, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } })
      : Promise.resolve([]);

    const memory = this.prismaAny().memory;
    const memoryPromise = memory
      ? memory.findMany({ where: { userId, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } })
      : Promise.resolve([]);

    const completedPromises = USER_LIB_TYPES.map(async (cfg) => {
      const delegate = this.prismaAny()[cfg.delegate];
      if (!delegate) return [];
      return delegate.findMany({
        where: { userId, updatedAt: { gte: startDate, lte: endDate }, status: 'COMPLETED', deletedAt: null },
        select: { updatedAt: true, minutesSpent: true, hoursSpent: true },
      });
    });

    const [entries, mems, completedResults] = await Promise.all([
      journalPromise,
      memoryPromise,
      Promise.all(completedPromises),
    ]);

    for (const e of entries) {
      const key = e.createdAt.toISOString().slice(0, 10);
      journalCounts[key] = (journalCounts[key] ?? 0) + 1;
    }
    for (const m of mems) {
      const key = m.createdAt.toISOString().slice(0, 10);
      memoryCounts[key] = (memoryCounts[key] ?? 0) + 1;
    }
    for (const items of completedResults) {
      for (const item of items) {
        const key = item.updatedAt.toISOString().slice(0, 10);
        completedCounts[key] = (completedCounts[key] ?? 0) + 1;
        const hours = (item.hoursSpent ?? 0) + (item.minutesSpent ?? 0) / 60;
        hoursTracked[key] = (hoursTracked[key] ?? 0) + hours;
      }
    }

    return { journalCounts, memoryCounts, completedCounts, hoursTracked };
  }

  // ─── Genre Stats ──────────────────────────────────────────────────────────

  async getGenreData(userId: string): Promise<GenreRawData> {
    const genreCounts: Record<string, number> = {};
    const genreCompleted: Record<string, number> = {};
    const genreRatings: Record<string, { total: number; count: number }> = {};
    const genreTime: Record<string, number> = {};

    const allItems = await Promise.all(
      USER_LIB_TYPES.map(async (cfg) => {
        const delegate = this.prismaAny()[cfg.delegate];
        if (!delegate) return [];
        const items = await delegate.findMany({
          where: { userId, deletedAt: null },
          select: { 
            status: true, 
            rating: true, 
            minutesSpent: true, 
            hoursSpent: true,
            [cfg.mediaDelegate]: { select: { genres: true } }
          },
        });
        return items.map((item: any) => ({ ...item, _mediaDelegateKey: cfg.mediaDelegate }));
      })
    );

    for (const items of allItems) {
      for (const item of items) {
        const media = item[item._mediaDelegateKey];
        const genres: string[] = media?.genres ?? [];
        for (const genre of genres) {
          genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
          if (item.status === 'COMPLETED') genreCompleted[genre] = (genreCompleted[genre] ?? 0) + 1;
          if (item.rating) {
            if (!genreRatings[genre]) genreRatings[genre] = { total: 0, count: 0 };
            genreRatings[genre].total += item.rating;
            genreRatings[genre].count++;
          }
          const hours = (item.hoursSpent ?? 0) + (item.minutesSpent ?? 0) / 60;
          genreTime[genre] = (genreTime[genre] ?? 0) + hours;
        }
      }
    }

    return { genreCounts, genreCompleted, genreRatings, genreTime };
  }

  // ─── Timeline / Activity Feed ──────────────────────────────────────────────

  async getRecentTimelineEvents(userId: string, limit = 20): Promise<any[]> {
    const delegate = this.prismaAny().timelineEvent;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId },
      orderBy: { eventDate: 'desc' },
      take: limit,
    });
  }

  // ─── Analytics Snapshot ───────────────────────────────────────────────────

  async saveSnapshot(userId: string, data: Record<string, any>): Promise<void> {
    const delegate = this.prismaAny().analyticsSnapshot;
    if (!delegate) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await delegate.upsert({
      where: { userId_snapshotDate: { userId, snapshotDate: today } },
      update: { ...data },
      create: { userId, snapshotDate: today, ...data },
    });
  }

  async getSnapshots(userId: string, limit = 30): Promise<any[]> {
    const delegate = this.prismaAny().analyticsSnapshot;
    if (!delegate) return [];
    return delegate.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'desc' },
      take: limit,
    });
  }
}

interface CalendarRawData {
  journalCounts: Record<string, number>;
  memoryCounts: Record<string, number>;
  completedCounts: Record<string, number>;
  hoursTracked: Record<string, number>;
}

interface GenreRawData {
  genreCounts: Record<string, number>;
  genreCompleted: Record<string, number>;
  genreRatings: Record<string, { total: number; count: number }>;
  genreTime: Record<string, number>;
}


