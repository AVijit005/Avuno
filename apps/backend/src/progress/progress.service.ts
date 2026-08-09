import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ProgressRepository } from './progress.repository';
import {
  ProgressCalculationService,
  type MediaTotals,
  type ProgressInput,
  type RemainingOutput,
  type ProgressOutput,
} from './progress-calculation.service';
import { ProgressEventService } from './progress-event.service';
import type { UpdateProgressDto } from './dto/progress.dto';
import type { ProgressResponseDto, ProgressTotalDto, RecentProgressItemDto } from './dto/progress.dto';

interface ProgressUpdateData {
  progress: number;
  progressPercentage: number;
  status?: string;
  finishedAt?: Date | null;
  startedAt?: Date | null;
  currentEpisode?: number | null;
  currentSeason?: number | null;
  currentChapter?: number | null;
  currentPage?: number | null;
  currentTrack?: number | null;
  currentLesson?: number | null;
  hoursSpent?: number | null;
  minutesSpent?: number | null;
}

interface LibraryItemWithMedia {
  id: string;
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
export class ProgressService {
  constructor(
    private readonly repository: ProgressRepository,
    private readonly calculator: ProgressCalculationService,
    private readonly events: ProgressEventService,
  ) {}

  async update(userId: string, id: string, type: string, dto: UpdateProgressDto): Promise<ProgressResponseDto> {
    const item = await this.repository.findLibraryItem(id, type);
    if (!item) throw new NotFoundException('Library item not found');
    if (item.userId !== userId) throw new NotFoundException('Library item not found');

    const mediaId =
      item.movieId ??
      item.tvShowId ??
      item.animeId ??
      item.bookId ??
      item.gameId ??
      item.musicAlbumId ??
      item.podcastId ??
      item.courseId;
    const totals = mediaId ? await this.repository.fetchMediaTotals(type, mediaId) : emptyMediaTotals();

    const wasZero = (item.progress ?? 0) === 0;
    const wasCompleted = item.status === 'COMPLETED';

    const input: ProgressInput = {
      progress: dto.progress ?? item.progress ?? 0,
      currentEpisode: dto.currentEpisode ?? item.currentEpisode ?? null,
      currentSeason: dto.currentSeason ?? item.currentSeason ?? null,
      currentChapter: dto.currentChapter ?? item.currentChapter ?? null,
      currentPage: dto.currentPage ?? item.currentPage ?? null,
      currentTrack: dto.currentTrack ?? item.currentTrack ?? null,
      currentLesson: dto.currentLesson ?? item.currentLesson ?? null,
      currentModule: dto.currentModule ?? item.currentModule ?? null,
      hoursSpent: dto.hoursSpent ?? item.hoursSpent ?? null,
      minutesSpent: dto.minutesSpent ?? item.minutesSpent ?? null,
    };

    const calculated: ProgressOutput = this.calculator.calculate(type, input, totals);
    const clampedProgress = Math.max(0, Math.min(calculated.progress, 100));
    const clampedPercentage = Math.max(0, Math.min(calculated.progressPercentage, 100));

    const isComplete = clampedProgress >= 100 || clampedPercentage >= 100;
    const isStarting = !wasZero && clampedProgress > 0;

    const updateData: ProgressUpdateData = {
      progress: clampedProgress,
      progressPercentage: clampedPercentage,
    };

    if (dto.currentEpisode !== undefined) updateData.currentEpisode = dto.currentEpisode;
    if (dto.currentSeason !== undefined) updateData.currentSeason = dto.currentSeason;
    if (dto.currentChapter !== undefined) updateData.currentChapter = dto.currentChapter;
    if (dto.currentPage !== undefined) updateData.currentPage = dto.currentPage;
    if (dto.currentTrack !== undefined) updateData.currentTrack = dto.currentTrack;
    if (dto.currentLesson !== undefined) updateData.currentLesson = dto.currentLesson;
    if (dto.hoursSpent !== undefined) updateData.hoursSpent = dto.hoursSpent;
    if (dto.minutesSpent !== undefined) updateData.minutesSpent = dto.minutesSpent;

    if (isComplete && !wasCompleted) {
      updateData.status = 'COMPLETED';
      updateData.finishedAt = new Date();
      updateData.progress = 100;
      updateData.progressPercentage = 100;
    } else if (isStarting && !item.startedAt) {
      updateData.startedAt = new Date();
    }

    const updated = await this.repository.updateProgress(
      id,
      type,
      userId,
      updateData as unknown as Record<string, unknown>,
    );
    if (!updated) throw new NotFoundException('Library item not found');

    await this.emitEvents(userId, id, type, wasZero, wasCompleted, isComplete, clampedProgress);

    return this.toResponse(updated, type, totals, calculated);
  }

  async getProgress(userId: string, id: string, type: string): Promise<ProgressResponseDto> {
    const item = await this.repository.findLibraryItem(id, type);
    if (!item) throw new NotFoundException('Library item not found');
    if (item.userId !== userId) throw new NotFoundException('Library item not found');

    const mediaId =
      item.movieId ??
      item.tvShowId ??
      item.animeId ??
      item.bookId ??
      item.gameId ??
      item.musicAlbumId ??
      item.podcastId ??
      item.courseId;
    const totals = mediaId ? await this.repository.fetchMediaTotals(type, mediaId) : emptyMediaTotals();

    const input: ProgressInput = {
      progress: item.progress ?? 0,
      currentEpisode: item.currentEpisode ?? null,
      currentSeason: item.currentSeason ?? null,
      currentChapter: item.currentChapter ?? null,
      currentPage: item.currentPage ?? null,
      currentTrack: item.currentTrack ?? null,
      currentLesson: item.currentLesson ?? null,
      currentModule: item.currentModule ?? null,
      hoursSpent: item.hoursSpent ?? null,
      minutesSpent: item.minutesSpent ?? null,
    };

    const calculated = this.calculator.calculate(type, input, totals);

    return this.toResponse(item, type, totals, calculated);
  }

  async complete(userId: string, id: string, type: string): Promise<ProgressResponseDto> {
    return this.update(userId, id, type, { progress: 100 });
  }

  async reset(userId: string, id: string, type: string): Promise<ProgressResponseDto> {
    const item = await this.repository.findLibraryItem(id, type);
    if (!item) throw new NotFoundException('Library item not found');
    if (item.userId !== userId) throw new NotFoundException('Library item not found');

    const mediaId =
      item.movieId ??
      item.tvShowId ??
      item.animeId ??
      item.bookId ??
      item.gameId ??
      item.musicAlbumId ??
      item.podcastId ??
      item.courseId;
    const totals = mediaId ? await this.repository.fetchMediaTotals(type, mediaId) : emptyMediaTotals();

    const updateData: ProgressUpdateData = {
      progress: 0,
      progressPercentage: 0,
      status: 'PLANNING',
      startedAt: null,
      finishedAt: null,
      currentEpisode: null,
      currentSeason: null,
      currentChapter: null,
      currentPage: null,
      currentTrack: null,
      currentLesson: null,
      hoursSpent: null,
      minutesSpent: null,
    };

    const updated = await this.repository.updateProgress(
      id,
      type,
      userId,
      updateData as unknown as Record<string, unknown>,
    );
    if (!updated) throw new NotFoundException('Library item not found');

    await this.events.emitReset(userId, id, type);

    const calculated = { progress: 0, progressPercentage: 0 };
    return this.toResponse(updated, type, totals, calculated);
  }

  async getRecent(userId: string, limit = 20): Promise<RecentProgressItemDto[]> {
    const items = await this.repository.findRecentByUserId(userId, limit);
    return items.map((item) => {
      const mediaType = item._mediaType ?? 'unknown';
      const joined = (item as LibraryItemWithMedia)[mediaType] as Record<string, unknown> | undefined;
      return {
        libraryId: item.id,
        mediaId: ((item as LibraryItemWithMedia)[`${mediaType}Id`] as string) ?? '',
        title: (joined?.title as string) ?? 'Unknown',
        slug: (joined?.slug as string) ?? '',
        posterUrl: (joined?.posterUrl as string | null) ?? null,
        mediaType,
        progress: item.progress ?? 0,
        progressPercentage: item.progressPercentage ?? 0,
        status: item.status ?? 'PLANNING',
        updatedAt: (item.lastInteractionAt ?? item.updatedAt)?.toISOString() ?? new Date().toISOString(),
      };
    });
  }

  private async emitEvents(
    userId: string,
    id: string,
    type: string,
    wasZero: boolean,
    wasCompleted: boolean,
    isComplete: boolean,
    progress: number,
  ): Promise<void> {
    if (isComplete && !wasCompleted) {
      await this.events.emitCompleted(userId, id, type);
    } else if (progress > 0 && wasZero) {
      await this.events.emitStarted(userId, id, type);
    } else {
      await this.events.emitUpdated(userId, id, type, progress, progress);
    }
  }

  private toResponse(
    item: LibraryItemWithMedia,
    type: string,
    totals: MediaTotals,
    calculated: { progress: number; progressPercentage: number },
  ): ProgressResponseDto {
    const rem = this.calculator.calculateRemaining(type, totals, calculated.progressPercentage);

    return {
      progress: calculated.progress,
      progressPercentage: calculated.progressPercentage,
      currentEpisode: item.currentEpisode ?? null,
      currentSeason: item.currentSeason ?? null,
      currentChapter: item.currentChapter ?? null,
      currentPage: item.currentPage ?? null,
      currentTrack: item.currentTrack ?? null,
      currentLesson: item.currentLesson ?? null,
      currentModule: item.currentModule ?? null,
      hoursSpent: item.hoursSpent ?? null,
      minutesSpent: item.minutesSpent ?? null,
      startedAt: item.startedAt?.toISOString() ?? null,
      finishedAt: item.finishedAt?.toISOString() ?? null,
      lastInteractionAt: (item.lastInteractionAt ?? item.updatedAt)?.toISOString() ?? null,
      status: item.status ?? 'PLANNING',
      mediaType: type,
      total: this.buildTotalDto(totals, rem),
    };
  }

  private buildTotalDto(totals: MediaTotals, rem: RemainingOutput): ProgressTotalDto {
    return {
      totalEpisodes: totals.totalEpisodes,
      totalSeasons: totals.totalSeasons,
      totalChapters: null,
      totalPages: totals.pageCount,
      totalTracks: totals.totalTracks,
      totalLessons: totals.totalLessons,
      totalModules: totals.totalModules,
      runtime: totals.runtime,
      remaining: {
        episodes: rem.episodes,
        pages: rem.pages,
        lessons: rem.lessons,
        runtime: rem.runtime,
      },
    };
  }
}

function emptyMediaTotals(): MediaTotals {
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
