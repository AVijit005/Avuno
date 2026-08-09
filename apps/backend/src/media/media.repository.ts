import { Injectable } from '@nestjs/common';
import type { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { asHost, delegate, type QueryableDelegate } from '../common/prisma-delegates';

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
  private readonly modelMap: Record<string, string>;

  constructor(private readonly prisma: PrismaService) {
    this.modelMap = {
      movie: 'movie',
      tvShow: 'tvShow',
      tvSeason: 'tvSeason',
      tvEpisode: 'tvEpisode',
      anime: 'anime',
      animeEpisode: 'animeEpisode',
      book: 'book',
      game: 'game',
      musicArtist: 'musicArtist',
      musicAlbum: 'musicAlbum',
      musicTrack: 'musicTrack',
      podcast: 'podcast',
      podcastEpisode: 'podcastEpisode',
      course: 'course',
      courseModule: 'courseModule',
      courseLesson: 'courseLesson',
    };
  }

  getModelKeys(): string[] {
    return Object.keys(this.modelMap);
  }

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private getDelegate(type: string): QueryableDelegate | null {
    const key = this.modelMap[type];
    if (!key) return null;
    return delegate(this.host(), key);
  }

  async findById(type: string, id: string): Promise<MediaRow | null> {
    const del = this.getDelegate(type);
    if (!del) return null;
    const item = await del.findFirst({ where: { id, deletedAt: null } });
    return item as MediaRow | null;
  }

  private async findUniqueOrNull(del: QueryableDelegate, where: Record<string, unknown>): Promise<MediaRow | null> {
    try {
      const item = await del.findUnique({ where });
      return item as MediaRow | null;
    } catch {
      return null;
    }
  }

  async findBySlug(type: string, slug: string): Promise<MediaRow | null> {
    const del = this.getDelegate(type);
    if (!del) return null;
    return this.findUniqueOrNull(del, { slug });
  }

  async findMany(type: string | undefined, params: FindManyParams): Promise<MediaRow[]> {
    if (type) {
      const del = this.getDelegate(type);
      if (!del) return [];
      return this.executeFindMany(del, params);
    }

    const promises = this.getModelKeys().map((key) => {
      const del = this.getDelegate(key);
      if (!del) return Promise.resolve([] as MediaRow[]);
      return this.executeFindMany(del, params);
    });
    const results = await Promise.all(promises);
    let allResults = results.flat();
    const sortField = params.sortBy ?? 'createdAt';
    const sortOrder = params.sortOrder ?? 'desc';
    allResults.sort((a, b) => {
      const valA = a[sortField as keyof MediaRow] as string | number | Date | null;
      const valB = b[sortField as keyof MediaRow] as string | number | Date | null;
      const aStr = valA instanceof Date ? valA.toISOString() : String(valA ?? '');
      const bStr = valB instanceof Date ? valB.toISOString() : String(valB ?? '');
      if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1;
      return a.id.localeCompare(b.id);
    });
    return allResults.slice(0, params.limit + 1);
  }

  private async executeFindMany(del: QueryableDelegate, params: FindManyParams): Promise<MediaRow[]> {
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

    const items = await del.findMany(query);
    return items as unknown as MediaRow[];
  }

  async count(type: string | undefined, params: FindManyParams): Promise<number> {
    if (type) {
      const del = this.getDelegate(type);
      if (!del) return 0;
      return del.count({ where: buildWhere(params) });
    }

    const promises = this.getModelKeys().map((key) => {
      const del = this.getDelegate(key);
      if (!del) return Promise.resolve(0);
      return del.count({ where: buildWhere(params) });
    });
    const counts = await Promise.all(promises);
    return counts.reduce((acc, count) => acc + (typeof count === 'number' ? count : 0), 0);
  }

  async findRelated(type: string, id: string, limit = 10): Promise<MediaRow[]> {
    const item = await this.findById(type, id);
    if (!item) return [];

    const del = this.getDelegate(type);
    if (!del) return [];

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

    const items = await del.findMany({
      where,
      orderBy: [{ releaseYear: 'desc' as const }, { id: 'asc' as const }],
      take: limit,
    });
    return items as unknown as MediaRow[];
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
