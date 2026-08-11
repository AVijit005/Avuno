import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '../auth';
import { safeParseInt } from '../shared';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { JournalService } from './journal.service';
import {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  JournalEntryResponseDto,
  CreateMemoryDto,
  UpdateMemoryDto,
  MemoryResponseDto,
  CreateTimelineEventDto,
  TimelineEventResponseDto,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteResponseDto,
  CreateHighlightDto,
  UpdateHighlightDto,
  HighlightResponseDto,
  JournalStatisticsDto,
  MediaTypeQueryDto,
} from './dto';

@ApiTags('Journal')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  // ─── Journal Entries ──────────────────────────────────────────────────────

  @Post('journal')
  @ApiOperation({ summary: 'Create a journal entry' })
  async createEntry(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    return this.journalService.createEntry(user.sub, dto);
  }

  @Get('journal')
  @ApiOperation({ summary: 'List journal entries' })
  async findEntries(
    @CurrentUser() user: AccessTokenPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.journalService.findEntries(user.sub, cursor, safeParseInt(limit, 20));
  }

  // ─── Statistics & Prompts ─────────────────────────────────────────────────

  @Get('journal/stats')
  @ApiOperation({ summary: 'Get journal statistics' })
  async getStats(@CurrentUser() user: AccessTokenPayload): Promise<JournalStatisticsDto> {
    return this.journalService.getStatistics(user.sub);
  }

  @Get('journal/prompts')
  @ApiOperation({ summary: 'Get all journal prompts' })
  async getPrompts(@CurrentUser() _user: AccessTokenPayload): Promise<string[]> {
    return this.journalService.getAllPrompts();
  }

  @Get('journal/:id')
  @ApiOperation({ summary: 'Get a journal entry' })
  async findEntry(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<JournalEntryResponseDto> {
    return this.journalService.findEntry(id, user.sub);
  }

  @Patch('journal/:id')
  @ApiOperation({ summary: 'Update a journal entry' })
  async updateEntry(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    return this.journalService.updateEntry(id, user.sub, dto);
  }

  @Delete('journal/:id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  async deleteEntry(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<void> {
    return this.journalService.deleteEntry(id, user.sub);
  }

  // ─── Memories ─────────────────────────────────────────────────────────────

  @Post('memories')
  @ApiOperation({ summary: 'Create a memory' })
  async createMemory(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateMemoryDto,
  ): Promise<MemoryResponseDto> {
    return this.journalService.createMemory(user.sub, dto);
  }

  @Get('memories')
  @ApiOperation({ summary: 'List memories' })
  async findMemories(
    @CurrentUser() user: AccessTokenPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('mediaId') mediaId?: string,
    @Query('journalId') journalId?: string,
  ) {
    return this.journalService.findMemories(user.sub, {
      cursor,
      limit: safeParseInt(limit, 20),
      mediaId,
      journalId,
    });
  }

  @Get('memories/:id')
  @ApiOperation({ summary: 'Get a memory' })
  async findMemory(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<MemoryResponseDto> {
    return this.journalService.findMemory(id, user.sub);
  }

  @Patch('memories/:id')
  @ApiOperation({ summary: 'Update a memory' })
  async updateMemory(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMemoryDto,
  ): Promise<MemoryResponseDto> {
    return this.journalService.updateMemory(id, user.sub, dto);
  }

  @Delete('memories/:id')
  @ApiOperation({ summary: 'Delete a memory' })
  async deleteMemory(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<void> {
    return this.journalService.deleteMemory(id, user.sub);
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  @Post('timeline/events')
  @ApiOperation({ summary: 'Create a manual timeline event' })
  async createTimelineEvent(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateTimelineEventDto,
  ): Promise<TimelineEventResponseDto> {
    return this.journalService.createTimelineEvent(user.sub, dto);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'List timeline events' })
  async findTimelineEvents(
    @CurrentUser() user: AccessTokenPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.journalService.findTimelineEvents(user.sub, undefined, undefined, cursor, safeParseInt(limit, 50));
  }

  @Get('timeline/:year')
  @ApiOperation({ summary: 'List timeline events for a year' })
  async findTimelineByYear(
    @CurrentUser() user: AccessTokenPayload,
    @Param('year') year: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.journalService.findTimelineEvents(
      user.sub,
      safeParseInt(year, new Date().getFullYear()),
      undefined,
      cursor,
      safeParseInt(limit, 50),
    );
  }

  @Get('timeline/:year/:month')
  @ApiOperation({ summary: 'List timeline events for a month' })
  async findTimelineByMonth(
    @CurrentUser() user: AccessTokenPayload,
    @Param('year') year: string,
    @Param('month') month: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.journalService.findTimelineEvents(
      user.sub,
      safeParseInt(year, new Date().getFullYear()),
      safeParseInt(month, new Date().getMonth() + 1),
      cursor,
      safeParseInt(limit, 50),
    );
  }

  // ─── Quotes ───────────────────────────────────────────────────────────────

  @Post('library/:id/quotes')
  @ApiOperation({ summary: 'Add a quote to a library item' })
  async createQuote(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    // Validated via DTO: `type` selects a Prisma delegate, so a bare string
    // would be arbitrary delegate access.
    @Query() query: MediaTypeQueryDto,
    @Body() dto: CreateQuoteDto,
  ): Promise<QuoteResponseDto> {
    return this.journalService.createQuote(user.sub, id, dto, query.type);
  }

  @Patch('library/:id/quotes/:quoteId')
  @ApiOperation({ summary: 'Update a quote' })
  async updateQuote(
    @CurrentUser() user: AccessTokenPayload,
    @Param('quoteId') quoteId: string,
    @Body() dto: UpdateQuoteDto,
  ): Promise<QuoteResponseDto> {
    return this.journalService.updateQuote(quoteId, user.sub, dto);
  }

  @Delete('library/:id/quotes/:quoteId')
  @ApiOperation({ summary: 'Delete a quote' })
  async deleteQuote(@CurrentUser() user: AccessTokenPayload, @Param('quoteId') quoteId: string): Promise<void> {
    return this.journalService.deleteQuote(quoteId, user.sub);
  }

  // ─── Highlights ───────────────────────────────────────────────────────────

  @Post('library/:id/highlights')
  @ApiOperation({ summary: 'Add a highlight to a library item' })
  async createHighlight(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query() query: MediaTypeQueryDto,
    @Body() dto: CreateHighlightDto,
  ): Promise<HighlightResponseDto> {
    return this.journalService.createHighlight(user.sub, id, dto, query.type);
  }

  @Patch('library/:id/highlights/:highlightId')
  @ApiOperation({ summary: 'Update a highlight' })
  async updateHighlight(
    @CurrentUser() user: AccessTokenPayload,
    @Param('highlightId') highlightId: string,
    @Body() dto: UpdateHighlightDto,
  ): Promise<HighlightResponseDto> {
    return this.journalService.updateHighlight(highlightId, user.sub, dto);
  }

  @Delete('library/:id/highlights/:highlightId')
  @ApiOperation({ summary: 'Delete a highlight' })
  async deleteHighlight(
    @CurrentUser() user: AccessTokenPayload,
    @Param('highlightId') highlightId: string,
  ): Promise<void> {
    return this.journalService.deleteHighlight(highlightId, user.sub);
  }
}
