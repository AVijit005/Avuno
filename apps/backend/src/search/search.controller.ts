import { Controller, Delete, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto';
import type { SearchResponseDto, SuggestionsResponseDto, TrendingItemDto, FilterOptionsDto } from './dto';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across all content' })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async search(@CurrentUser() user: AccessTokenPayload, @Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(user.sub, query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Search suggestions / autocomplete' })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async suggestions(
    @CurrentUser() user: AccessTokenPayload,
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<SuggestionsResponseDto> {
    return this.searchService.getSuggestions(user.sub, q ?? '', limit ? parseInt(limit, 10) : 8);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Recent searches' })
  async recentSearches(@CurrentUser() user: AccessTokenPayload): Promise<string[]> {
    return this.searchService.getRecentSearches(user.sub);
  }

  @Delete('recent')
  @ApiOperation({ summary: 'Clear search history' })
  async clearRecentSearches(@CurrentUser() user: AccessTokenPayload): Promise<void> {
    return this.searchService.clearSearchHistory(user.sub);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Trending media' })
  async trending(@CurrentUser() user: AccessTokenPayload, @Query('limit') limit?: string): Promise<TrendingItemDto[]> {
    return this.searchService.getTrending(limit ? parseInt(limit, 10) : 10);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Available filter options' })
  async filterOptions(): Promise<FilterOptionsDto> {
    return this.searchService.getFilterOptions();
  }
}
