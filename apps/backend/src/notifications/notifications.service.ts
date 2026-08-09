import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationQueueService } from './notification-queue.service';
import type {
  NotificationResponseDto,
  NotificationPreferencesDto,
  UpdateNotificationPreferencesDto,
  NotificationListDto,
} from './dto';

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  image?: string | null;
  createdAt: Date;
  readAt?: Date | null;
}

interface PreferenceRow {
  emailEnabled: boolean;
  pushEnabled: boolean;
  browserEnabled: boolean;
  marketingEnabled: boolean;
  weeklyWrapped: boolean;
  monthlyReport: boolean;
  friendActivity: boolean;
  reminders: boolean;
}

interface PreferenceUpdateData {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  browserEnabled?: boolean;
  marketingEnabled?: boolean;
  weeklyWrapped?: boolean;
  monthlyReport?: boolean;
  friendActivity?: boolean;
  reminders?: boolean;
  [key: string]: unknown;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly queueService: NotificationQueueService,
  ) {}

  async findAll(userId: string, cursor?: string, limit = 20): Promise<NotificationListDto> {
    const [items, unreadCount] = await Promise.all([
      this.repository.findByUserId(userId, cursor, limit),
      this.repository.countUnread(userId),
    ]);

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;

    return {
      items: sliced.map((n) => this.toResponse(n as NotificationRow)),
      total: sliced.length,
      unreadCount,
      hasMore,
      cursor: sliced.length > 0 ? sliced[sliced.length - 1].createdAt.toISOString() : null,
    };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationResponseDto> {
    const ok = await this.repository.markAsRead(id, userId);
    if (!ok) throw new NotFoundException('Notification not found');
    const notification = await this.repository.findById(id, userId);
    return this.toResponse(notification!);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.repository.markAllAsRead(userId);
    return { count };
  }

  async remove(id: string, userId: string): Promise<void> {
    const ok = await this.repository.delete(id, userId);
    if (!ok) throw new NotFoundException('Notification not found');
  }

  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const prefs = await this.repository.getPreferences(userId);
    if (!prefs) {
      return {
        emailEnabled: true,
        pushEnabled: true,
        browserEnabled: true,
        marketingEnabled: false,
        weeklyWrapped: true,
        monthlyReport: true,
        friendActivity: true,
        reminders: true,
      };
    }
    return this.toPreferencesResponse(prefs);
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    const data: PreferenceUpdateData = {};
    if (dto.emailEnabled !== undefined) data.emailEnabled = dto.emailEnabled;
    if (dto.pushEnabled !== undefined) data.pushEnabled = dto.pushEnabled;
    if (dto.browserEnabled !== undefined) data.browserEnabled = dto.browserEnabled;
    if (dto.marketingEnabled !== undefined) data.marketingEnabled = dto.marketingEnabled;
    if (dto.weeklyWrapped !== undefined) data.weeklyWrapped = dto.weeklyWrapped;
    if (dto.monthlyReport !== undefined) data.monthlyReport = dto.monthlyReport;
    if (dto.friendActivity !== undefined) data.friendActivity = dto.friendActivity;
    if (dto.reminders !== undefined) data.reminders = dto.reminders;

    const prefs = await this.repository.upsertPreferences(userId, data);
    return this.toPreferencesResponse(prefs);
  }

  async sendTest(userId: string, title: string, body: string, type = 'SYSTEM'): Promise<NotificationResponseDto> {
    const notification = await this.repository.create({
      userId,
      title,
      body,
      type,
    });
    return this.toResponse(notification);
  }

  async getQueueMetrics(): Promise<
    Record<string, { waiting: number; active: number; completed: number; failed: number }>
  > {
    return this.queueService.getQueueMetrics();
  }

  private toResponse(n: NotificationRow): NotificationResponseDto {
    return {
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      isRead: n.isRead ?? false,
      actionUrl: n.actionUrl ?? null,
      image: n.image ?? null,
      createdAt: n.createdAt?.toISOString() ?? '',
      readAt: n.readAt?.toISOString() ?? null,
    };
  }

  private toPreferencesResponse(p: PreferenceRow): NotificationPreferencesDto {
    return {
      emailEnabled: p.emailEnabled ?? true,
      pushEnabled: p.pushEnabled ?? true,
      browserEnabled: p.browserEnabled ?? true,
      marketingEnabled: p.marketingEnabled ?? false,
      weeklyWrapped: p.weeklyWrapped ?? true,
      monthlyReport: p.monthlyReport ?? true,
      friendActivity: p.friendActivity ?? true,
      reminders: p.reminders ?? true,
    };
  }
}
