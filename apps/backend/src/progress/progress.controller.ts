import { safeParseInt } from '../shared';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { ProgressService } from './progress.service';
import { UpdateProgressDto, ProgressResponseDto, RecentProgressItemDto } from './dto';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Patch(':id/progress')
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<ProgressResponseDto> {
    return this.progressService.update(user.sub, id, type, dto);
  }

  @Get(':id/progress')
  async getProgress(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
  ): Promise<ProgressResponseDto> {
    return this.progressService.getProgress(user.sub, id, type);
  }

  @Post(':id/progress/complete')
  async complete(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
  ): Promise<ProgressResponseDto> {
    return this.progressService.complete(user.sub, id, type);
  }

  @Post(':id/progress/reset')
  async reset(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Query('type') type: string,
  ): Promise<ProgressResponseDto> {
    return this.progressService.reset(user.sub, id, type);
  }

  @Get('progress/recent')
  async getRecent(
    @CurrentUser() user: AccessTokenPayload,
    @Query('limit') limit?: string,
  ): Promise<RecentProgressItemDto[]> {
    return this.progressService.getRecent(user.sub, limit ? safeParseInt(limit, 20) : 20);
  }
}
