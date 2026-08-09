import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { SearchSuggestionService } from './search-suggestion.service';
import { SearchStatisticsService } from './search-statistics.service';
import type { SearchQueryDto, SearchResponseDto, SearchResultItemDto, SearchFacetsDto } from './dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly suggestionService: SearchSuggestionService,
    private readonly statsService: SearchStatisticsService,
  ) {}

  async search(userId: string, dto: SearchQueryDto): Promise<SearchResponseDto> {
    const q = dto.q.trim();
    const mode = dto.mode ?? 'global';
    const typeFilter = dto.type;
    const limit = dto.limit ? Math.min(parseInt(dto.limit, 10), 50) : 20;

    if (!q) {
      return { items: [], total: 0, hasMore: false, cursor: null };
    }

    let items: SearchResultItemDto[] = [];

    switch (mode) {
      case 'library':
        items = await this.repository.searchLibrary(userId, q, typeFilter, limit);
        break;
      case 'media':
        items = await this.repository.searchMedia(q, typeFilter, limit);
        break;
      case 'journal':
        items = await this.repository.searchJournal(userId, q, limit);
        break;
      case 'collections':
        items = await this.repository.searchCollections(userId, q, limit);
        break;
      case 'timeline':
        items = await this.repository.searchTimeline(userId, q, limit);
        break;
      case 'global':
      default: {
        // Run all searches in parallel
        const [media, library, journal, collections, memories, quotes, highlights, shelves, timeline] =
          await Promise.all([
            this.repository.searchMedia(q, typeFilter, limit),
            this.repository.searchLibrary(userId, q, typeFilter, limit),
            this.repository.searchJournal(userId, q, limit),
            this.repository.searchCollections(userId, q, limit),
            this.repository.searchMemories(userId, q, limit),
            this.repository.searchQuotes(userId, q, limit),
            this.repository.searchHighlights(userId, q, limit),
            this.repository.searchShelves(userId, q, limit),
            this.repository.searchTimeline(userId, q, limit),
          ]);

        // Merge and sort by score
        const all = [
          ...media,
          ...library,
          ...journal,
          ...collections,
          ...memories,
          ...quotes,
          ...highlights,
          ...shelves,
          ...timeline,
        ];
        all.sort((a, b) => b.score - a.score);
        items = all.slice(0, limit);
        break;
      }
    }

    // Sort
    this.applySort(items, dto.sort);

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;

    // Record search
    await this.repository.recordSearch(userId, q, { mode, type: typeFilter }, sliced.length);

    // Build facets
    const facets = this.buildFacets(sliced);

    return {
      items: sliced,
      total: sliced.length,
      hasMore,
      cursor: sliced.length > 0 ? `${sliced[sliced.length - 1].score}_${sliced[sliced.length - 1].id}` : null,
      facets,
    };
  }

  // ─── Delegated services ──────────────────────────────────────────────────

  getSuggestions(userId: string, q: string, limit = 8) {
    return this.suggestionService.getSuggestions(userId, q, limit);
  }

  getRecentSearches(userId: string, limit = 10) {
    return this.suggestionService.getRecentSearches(userId, limit);
  }

  clearSearchHistory(userId: string) {
    return this.suggestionService.clearHistory(userId);
  }

  getTrending(limit = 10) {
    return this.statsService.getTrending(limit);
  }

  getFilterOptions() {
    return this.statsService.getFilterOptions();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private applySort(items: SearchResultItemDto[], sort?: string): void {
    switch (sort) {
      case 'recently_added':
        items.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      case 'recently_updated':
        items.sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime());
        break;
      case 'rating':
        items.sort((a, b) => {
          const bMeta = b.metadata as Record<string, unknown> | null;
          const aMeta = a.metadata as Record<string, unknown> | null;
          const bRating = (bMeta?.rating as number) ?? 0;
          const aRating = (aMeta?.rating as number) ?? 0;
          return bRating - aRating;
        });
        break;
      case 'alphabetical':
        items.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
      default:
        items.sort((a, b) => b.score - a.score);
        break;
    }
  }

  private buildFacets(items: SearchResultItemDto[]): SearchFacetsDto {
    const types: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    const genres: Record<string, number> = {};

    for (const item of items) {
      types[item.type] = (types[item.type] ?? 0) + 1;

      const meta = item.metadata as Record<string, unknown> | null;
      if (meta?.status) {
        statuses[meta.status as string] = (statuses[meta.status as string] ?? 0) + 1;
      }
      if (meta?.genre) {
        const genreList = Array.isArray(meta.genre) ? meta.genre : [meta.genre];
        for (const g of genreList) {
          const genre = g as string;
          genres[genre] = (genres[genre] ?? 0) + 1;
        }
      }
    }

    return {
      types,
      statuses: Object.keys(statuses).length > 0 ? statuses : undefined,
      genres: Object.keys(genres).length > 0 ? genres : undefined,
    };
  }
}
