import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { asHost, delegate, type QueryableDelegate } from '../common/prisma-delegates';

interface NotificationRow {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  image?: string | null;
  metadata?: Prisma.InputJsonValue;
  createdAt: Date;
  readAt?: Date | null;
}

interface PreferenceRow {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  browserEnabled: boolean;
  marketingEnabled: boolean;
  weeklyWrapped: boolean;
  monthlyReport: boolean;
  friendActivity: boolean;
  reminders: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private host(): ReturnType<typeof asHost> {
    return asHost(this.prisma);
  }

  private notification(): QueryableDelegate {
    return delegate(this.host(), 'notification');
  }

  private notificationPreference(): QueryableDelegate {
    return delegate(this.host(), 'notificationPreference');
  }

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    actionUrl?: string;
    image?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<NotificationRow> {
    const created = await this.notification().create({ data });
    return created as unknown as NotificationRow;
  }

  async findById(id: string, userId?: string): Promise<NotificationRow | null> {
    const notification = await this.notification().findUnique({ where: { id } });
    if (!notification || (userId && (notification as unknown as NotificationRow).userId !== userId)) return null;
    return notification as unknown as NotificationRow;
  }

  async findByUserId(userId: string, cursor?: string, limit = 20): Promise<NotificationRow[]> {
    const where: Record<string, unknown> = { userId };
    if (cursor) where.createdAt = { lt: cursor };
    const items = await this.notification().findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
    return items as unknown as NotificationRow[];
  }

  async countUnread(userId: string): Promise<number> {
    return this.notification().count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const result = await this.notification().updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notification().updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.notification().deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async getPreferences(userId: string): Promise<PreferenceRow | null> {
    const pref = await this.notificationPreference().findUnique({ where: { userId } });
    return pref as unknown as PreferenceRow | null;
  }

  async upsertPreferences(userId: string, data: Record<string, unknown>): Promise<PreferenceRow> {
    const pref = await this.notificationPreference().upsert({
      where: { userId },
      update: { ...data, updatedAt: new Date() },
      create: { userId, ...data },
    });
    return pref as unknown as PreferenceRow;
  }
}
