import { safeParseInt } from '../shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { InteractionService } from './interaction.service';
import {
  UpdateRatingDto,
  UpdateFavoriteDto,
  UpdateBookmarkDto,
  CreateReviewDto,
  UpdateReviewDto,
  RatingResponseDto,
  FavoriteResponseDto,
  BookmarkResponseDto,
  ReviewResponseDto,
} from './dto';

@ApiTags('Interaction')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  // ─── Rating ─────────────────────────────────────────────────────────────────

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Update rating for a library item' })
  async updateRating(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: UpdateRatingDto,
  ): Promise<RatingResponseDto> {
    return this.interactionService.updateRating(user.sub, id, type, dto);
  }

  // ─── Favorite ───────────────────────────────────────────────────────────────

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite on a library item' })
  async toggleFavorite(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: UpdateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    return this.interactionService.toggleFavorite(user.sub, id, type, dto);
  }

  // ─── Bookmark ───────────────────────────────────────────────────────────────

  @Patch(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark on a library item' })
  async toggleBookmark(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: UpdateBookmarkDto,
  ): Promise<BookmarkResponseDto> {
    return this.interactionService.toggleBookmark(user.sub, id, type, dto);
  }

  // ─── Review ─────────────────────────────────────────────────────────────────

  @Post(':id/review')
  @ApiOperation({ summary: 'Create a review for a library item' })
  async createReview(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.interactionService.createReview(user.sub, id, type, dto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Update an existing review' })
  async updateReview(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.interactionService.updateReview(user.sub, id, type, dto);
  }

  @Delete(':id/review')
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
  ): Promise<void> {
    return this.interactionService.deleteReview(user.sub, id, type);
  }

  // ─── List Queries ───────────────────────────────────────────────────────────

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  async listReviews(
    @CurrentUser() user: AccessTokenPayload,
    @Query('type') type?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.interactionService.listReviews(user.sub, type, cursor, limit ? safeParseInt(limit, 20) : 20);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'List all favorites' })
  async listFavorites(
    @CurrentUser() user: AccessTokenPayload,
    @Query('type') type?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.interactionService.listFavorites(user.sub, type, cursor, limit ? safeParseInt(limit, 20) : 20);
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'List all bookmarks' })
  async listBookmarks(
    @CurrentUser() user: AccessTokenPayload,
    @Query('type') type?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.interactionService.listBookmarks(user.sub, type, cursor, limit ? safeParseInt(limit, 20) : 20);
  }

  @Get('history')
  @ApiOperation({ summary: 'List activity history' })
  async listHistory(
    @CurrentUser() user: AccessTokenPayload,
    @Query('type') type?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.interactionService.listHistory(user.sub, type, cursor, limit ? safeParseInt(limit, 20) : 20);
  }
}
