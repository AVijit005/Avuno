import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { LibraryService, type LibraryListResult } from './library.service';
import { LibraryStatisticsService, type LibraryStatistics } from './library-statistics.service';
import {
  AddToLibraryDto,
  IdParamDto,
  LibraryFilterDto,
  StatusParamDto,
  TypeParamDto,
  UpdateLibraryItemDto,
} from './dto';
import type { LibraryItemResponseDto } from './dto';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly statisticsService: LibraryStatisticsService,
  ) {}

  @Post()
  async add(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AddToLibraryDto,
    @Req() request: Request,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.add(user.sub, dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });
  }

  @Get()
  async list(@CurrentUser() user: AccessTokenPayload, @Query() filter: LibraryFilterDto): Promise<LibraryListResult> {
    return this.libraryService.list(user.sub, filter.mediaType, {
      status: filter.status,
      favorite: filter.favorite,
      hidden: filter.hidden,
      private: filter.private,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      search: filter.search,
      cursor: filter.cursor,
      limit: filter.limit,
    });
  }

  @Get('status/:status')
  async listByStatus(
    @CurrentUser() user: AccessTokenPayload,
    @Param() params: StatusParamDto,
    @Query() filter: LibraryFilterDto,
  ): Promise<LibraryListResult> {
    return this.libraryService.list(user.sub, filter.mediaType, {
      status: params.status,
      favorite: filter.favorite,
      hidden: filter.hidden,
      private: filter.private,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      search: filter.search,
      cursor: filter.cursor,
      limit: filter.limit,
    });
  }

  @Get('type/:type')
  async listByType(
    @CurrentUser() user: AccessTokenPayload,
    @Param() params: TypeParamDto,
    @Query() filter: LibraryFilterDto,
  ): Promise<LibraryListResult> {
    return this.libraryService.list(user.sub, params.type, {
      status: filter.status,
      favorite: filter.favorite,
      hidden: filter.hidden,
      private: filter.private,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      search: filter.search,
      cursor: filter.cursor,
      limit: filter.limit,
    });
  }

  @Get('stats')
  async getStats(@CurrentUser() user: AccessTokenPayload): Promise<LibraryStatistics> {
    return this.libraryService.getStatistics(user.sub);
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: AccessTokenPayload,
    @Param() params: IdParamDto,
    @Query('type') type?: string,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.findById(user.sub, params.id, type);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param() params: IdParamDto,
    @Query('type') type: string,
    @Body() dto: UpdateLibraryItemDto,
    @Req() request: Request,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.update(user.sub, params.id, type, dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'] as string | undefined,
    });
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param() params: IdParamDto,
    @Query('type') type: string,
  ): Promise<void> {
    return this.libraryService.remove(user.sub, params.id, type);
  }
}
