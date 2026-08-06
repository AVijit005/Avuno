import { safeParseInt } from '../shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '../auth';
import type { AccessTokenPayload } from '../auth/services/jwt-token.service';
import { NotificationsService } from './notifications.service';
import {
  NotificationListDto,
  NotificationResponseDto,
  NotificationPreferencesDto,
  UpdateNotificationPreferencesDto,
} from './dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  async findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<NotificationListDto> {
    return this.notificationsService.findAll(user.sub, cursor, limit ? safeParseInt(limit, 20) : 20);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: AccessTokenPayload): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id, user.sub);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUser() user: AccessTokenPayload): Promise<NotificationPreferencesDto> {
    return this.notificationsService.getPreferences(user.sub);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    return this.notificationsService.updatePreferences(user.sub, dto);
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test notification' })
  async sendTest(
    @CurrentUser() user: AccessTokenPayload,
    @Body('title') title: string,
    @Body('body') body: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.sendTest(user.sub, title, body);
  }
}
