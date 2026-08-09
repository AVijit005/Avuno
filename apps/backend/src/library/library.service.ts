import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { buildCursorMeta } from '../common';
import { LibraryRepository, type LibraryFindManyParams, type LibraryRow } from './library.repository';
import { LibraryStatisticsService, type LibraryStatistics } from './library-statistics.service';
import { isValidLibraryType } from './library.repository';
import type { LibraryItemResponseDto, AddToLibraryDto, UpdateLibraryItemDto } from './dto/library.dto';

export interface LibraryListResult {
  data: LibraryItemResponseDto[];
  hasMore: boolean;
  nextCursor?: string;
}

@Injectable()
export class LibraryService {
  constructor(
    private readonly repository: LibraryRepository,
    private readonly statisticsService: LibraryStatisticsService,
  ) {}

  async add(
    userId: string,
    dto: AddToLibraryDto,
    _metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<LibraryItemResponseDto> {
    if (!isValidLibraryType(dto.mediaType)) {
      throw new NotFoundException(`Invalid media type: ${dto.mediaType}`);
    }

    const mediaExists = await this.repository.verifyMediaExists(dto.mediaType, dto.mediaId);
    if (!mediaExists) {
      throw new NotFoundException(`${dto.mediaType} with id ${dto.mediaId} not found`);
    }

    try {
      const item = await this.repository.create(dto.mediaType, {
        userId,
        mediaId: dto.mediaId,
        status: dto.status,
        startedAt:
          dto.status === 'WATCHING' ||
          dto.status === 'READING' ||
          dto.status === 'PLAYING' ||
          dto.status === 'LISTENING' ||
          dto.status === 'LEARNING'
            ? new Date()
            : undefined,
      });

      return this.toResponse(item, dto.mediaType);
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).code === 'P2002') {
        throw new ConflictException('Item already exists in library');
      }
      throw error;
    }
  }

  async list(userId: string, type: string | undefined, params: LibraryFindManyParams): Promise<LibraryListResult> {
    const limit = params.limit || 20;
    const items = await this.repository.findAll(userId, type, { ...params, limit: limit + 1 });

    const meta = buildCursorMeta(items, (item) => item.id, limit);
    return {
      data: meta.data.map((item) => this.toResponse(item, type ?? this.detectMediaType(item))),
      hasMore: meta.hasMore,
      nextCursor: meta.nextCursor,
    };
  }

  async findById(userId: string, id: string, type?: string): Promise<LibraryItemResponseDto> {
    const item = await this.repository.findById(id, userId, type);
    if (!item) throw new NotFoundException('Library item not found');

    const mediaType = this.detectMediaType(item);
    return this.toResponse(item, mediaType);
  }

  async update(
    userId: string,
    id: string,
    type: string,
    dto: UpdateLibraryItemDto,
    _metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<LibraryItemResponseDto> {
    if (!isValidLibraryType(type)) throw new NotFoundException(`Invalid media type: ${type}`);

    const updateData: Record<string, unknown> = {};

    if (dto.status !== undefined) updateData.status = dto.status;
    const currentItem = await this.repository.findById(id, userId, type);
    if (!currentItem) throw new NotFoundException('Library item not found');

    if (dto.rating !== undefined) updateData.rating = dto.rating;
    if (dto.favorite !== undefined) updateData.favorite = dto.favorite;
    if (dto.hidden !== undefined) updateData.hidden = dto.hidden;
    if (dto.private !== undefined) updateData.private = dto.private;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.progress !== undefined) updateData.progress = dto.progress;
    if (dto.rewatchCount !== undefined) updateData.rewatchCount = dto.rewatchCount;
    if (dto.startedAt !== undefined) updateData.startedAt = new Date(dto.startedAt);
    if (dto.finishedAt !== undefined) updateData.finishedAt = new Date(dto.finishedAt);

    if (
      dto.status &&
      ['WATCHING', 'REWATCHING', 'PAUSED', 'READING', 'PLAYING', 'LISTENING', 'LEARNING', 'ON_HOLD'].includes(
        dto.status,
      ) &&
      !dto.startedAt &&
      !currentItem.startedAt
    ) {
      updateData.startedAt = new Date();
    }

    if (dto.status === 'COMPLETED' && !dto.finishedAt) {
      updateData.finishedAt = new Date();
    }
    if (dto.status === 'COMPLETED') {
      updateData.progress = 100;
    }
    if (dto.status === 'PLANNING') {
      updateData.progress = 0;
      updateData.startedAt = null;
      updateData.finishedAt = null;
    }

    updateData.lastInteractionAt = new Date();

    const item = await this.repository.update(id, userId, type, updateData);
    if (!item) throw new NotFoundException('Library item not found');

    return this.toResponse(item, type);
  }

  async remove(userId: string, id: string, type: string): Promise<void> {
    if (!isValidLibraryType(type)) throw new NotFoundException(`Invalid media type: ${type}`);

    const deleted = await this.repository.softDelete(id, userId, type);
    if (!deleted) throw new NotFoundException('Library item not found');
  }

  async getStatistics(userId: string): Promise<LibraryStatistics> {
    return this.statisticsService.getStatistics(userId);
  }

  private detectMediaType(item: LibraryRow): string {
    if (item.movie) return 'movie';
    if (item.tvShow) return 'tvShow';
    if (item.anime) return 'anime';
    if (item.book) return 'book';
    if (item.game) return 'game';
    if (item.musicAlbum) return 'musicAlbum';
    if (item.podcast) return 'podcast';
    if (item.course) return 'course';
    return 'unknown';
  }

  private toResponse(row: LibraryRow, mediaType: string): LibraryItemResponseDto {
    const media =
      row.media ?? ((row as unknown as Record<string, unknown>)[mediaType] as Record<string, unknown> | null) ?? null;

    return {
      id: row.id,
      status: row.status,
      rating: row.rating,
      rewatchCount: row.rewatchCount,
      favorite: row.favorite,
      hidden: row.hidden,
      private: row.private,
      notes: row.notes,
      startedAt: row.startedAt?.toISOString() ?? null,
      finishedAt: row.finishedAt?.toISOString() ?? null,
      lastInteractionAt: row.lastInteractionAt?.toISOString() ?? null,
      progress: row.progress,
      progressPercentage: row.progressPercentage,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      mediaType,
      media: media
        ? {
            id: media.id as string,
            slug: media.slug as string,
            title: media.title as string,
            posterUrl: (media.posterUrl as string | null) ?? null,
            backdropUrl: (media.backdropUrl as string | null) ?? null,
            releaseYear: (media.releaseYear as number | null) ?? null,
            genres: (media.genres as string[]) ?? [],
          }
        : null,
    };
  }
}
