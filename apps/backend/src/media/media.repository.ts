/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import type { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface FindManyParams {
  mediaType?: string;
  genre?: string;
  language?: string;
  country?: string;
  releaseYear?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
  limit: number;
}

export interface MediaRow {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  description: string | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  bannerUrl: string | null;
  coverImage: string | null;
  thumbnail: string | null;
  releaseDate: Date | null;
  releaseYear: number | null;
  runtime: number | null;
  duration: number | null;
  language: string | null;
  country: string | null;
  genres: string[];
  tags: string[];
  externalIds: Prisma.JsonValue | null;
  metadata: Prisma.JsonValue | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

function buildWhere(params: FindManyParams): Record<string, unknown> {
  const where: Record<string, unknown> = {
    deletedAt: null,
    status: params.status ?? 'PUBLISHED',
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { slug: { contains: params.search.toLowerCase(), mode: 'insensitive' } },
    ];
  }

  if (params.language) where.language = params.language;
  if (params.country) where.country = params.country;
  if (params.releaseYear) where.releaseYear = parseInt(params.releaseYear, 10);
  if (params.genre) where.genres = { has: params.genre };

  return where;
}

function buildOrderBy(params: FindManyParams): Record<string, string>[] {
  const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'releaseYear', 'slug'];
  const sortField = params.sortBy && ALLOWED_SORT_FIELDS.includes(params.sortBy) ? params.sortBy : 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
  return [{ [sortField]: sortOrder }, { id: 'asc' }];
}

@Injectable()
export class MediaRepository {
  private readonly modelMap: Record<string, keyof typeof this.prisma>;

  constructor(private readonly prisma: PrismaService) {
    this.modelMap = {
      movie: 'movie' as keyof typeof this.prisma,
      tvShow: 'tvShow' as keyof typeof this.prisma,
      tvSeason: 'tvSeason' as keyof typeof this.prisma,
      tvEpisode: 'tvEpisode' as keyof typeof this.prisma,
      anime: 'anime' as keyof typeof this.prisma,
      animeEpisode: 'animeEpisode' as keyof typeof this.prisma,
      book: 'book' as keyof typeof this.prisma,
      game: 'game' as keyof typeof this.prisma,
      musicArtist: 'musicArtist' as keyof typeof this.prisma,
      musicAlbum: 'musicAlbum' as keyof typeof this.prisma,
      musicTrack: 'musicTrack' as keyof typeof this.prisma,
      podcast: 'podcast' as keyof typeof this.prisma,
      podcastEpisode: 'podcastEpisode' as keyof typeof this.prisma,
      course: 'course' as keyof typeof this.prisma,
      courseModule: 'courseModule' as keyof typeof this.prisma,
      courseLesson: 'courseLesson' as keyof typeof this.prisma,
    };
  }

  getModelKeys(): string[] {
    return Object.keys(this.modelMap);
  }

  private getDelegate(type: string): any {
    const key = this.modelMap[type];
    if (!key) return null;
    return this.prisma[key];
  }

  async findById(type: string, id: string): Promise<MediaRow | null> {
    const delegate = this.getDelegate(type);
    if (!delegate) return null;
    return delegate.findFirst({ where: { id, deletedAt: null } });
  }

  private async findUniqueOrNull(delegate: any, where: Record<string, unknown>): Promise<MediaRow | null> {
    try {
      return (await delegate.findUnique({ where })) ?? null;
    } catch {
      return null;
    }
  }

  async findBySlug(type: string, slug: string): Promise<MediaRow | null> {
    const delegate = this.getDelegate(type);
    if (!delegate) return null;
    return this.findUniqueOrNull(delegate, { slug });
  }

  async findMany(type: string | undefined, params: FindManyParams): Promise<MediaRow[]> {
    if (type) {
      const delegate = this.getDelegate(type);
      if (!delegate) return [];
      return this.executeFindMany(delegate, params);
    }

    const promises = this.getModelKeys().map(key => {
      const delegate = this.getDelegate(key);
      if (!delegate) return Promise.resolve([]);
      return this.executeFindMany(delegate, params);
    });
    const results = await Promise.all(promises);
    let allResults = results.flat();
    const sortField = params.sortBy ?? 'createdAt';
    const sortOrder = params.sortOrder ?? 'desc';
    allResults.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
    return allResults.slice(0, params.limit + 1);
  }

  private async executeFindMany(delegate: any, params: FindManyParams): Promise<MediaRow[]> {
    const where = buildWhere(params);
    const orderBy = buildOrderBy(params);

    const query: Record<string, unknown> = {
      where,
      orderBy,
      take: params.limit + 1,
    };

    if (params.cursor) {
      query.skip = 1;
      query.cursor = { id: params.cursor };
    }

    return delegate.findMany(query as any);
  }

  async count(type: string | undefined, params: FindManyParams): Promise<number> {
    if (type) {
      const delegate = this.getDelegate(type);
      if (!delegate) return 0;
      return delegate.count({ where: buildWhere(params) as any });
    }

    const promises = this.getModelKeys().map(key => {
      const delegate = this.getDelegate(key);
      if (!delegate) return Promise.resolve(0);
      return delegate.count({ where: buildWhere(params) as any });
    });
    const counts = await Promise.all(promises);
    return counts.reduce((acc, count) => acc + (typeof count === 'number' ? count : 0), 0);
  }

  async findRelated(type: string, id: string, limit = 10): Promise<MediaRow[]> {
    const item = await this.findById(type, id);
    if (!item) return [];

    const delegate = this.getDelegate(type);
    if (!delegate) return [];

    const where: Record<string, unknown> = {
      id: { not: id },
      deletedAt: null,
      status: 'PUBLISHED' as ContentStatus,
    };

    if (item.genres.length > 0) {
      where.genres = { hasSome: item.genres.slice(0, 3) };
    }
    if (item.language) {
      where.language = item.language;
    }

    return delegate.findMany({
      where,
      orderBy: [{ releaseYear: 'desc' as const }, { id: 'asc' as const }],
      take: limit,
    });
  }

  async getMetadata(type: string, id: string): Promise<Record<string, unknown> | null> {
    const item = await this.findById(type, id);
    if (!item) return null;

    return {
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      bannerUrl: item.bannerUrl,
      coverImage: item.coverImage,
      thumbnail: item.thumbnail,
      runtime: item.runtime,
      duration: item.duration,
      genres: item.genres,
      externalIds: item.externalIds,
      metadata: item.metadata,
      releaseDate: item.releaseDate,
      releaseYear: item.releaseYear,
      language: item.language,
      country: item.country,
    } as Record<string, unknown>;
  }
}
