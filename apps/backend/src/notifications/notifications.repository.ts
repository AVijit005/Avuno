/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAny(): Record<string, any> {
    return this.prisma as unknown as Record<string, any>;
  }

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    actionUrl?: string;
    image?: string;
    metadata?: any;
  }): Promise<Record<string, any>> {
    const delegate = this.prismaAny().notification;
    if (!delegate) throw new Error('Notification model not available');
    return delegate.create({ data });
  }

  async findById(id: string, userId?: string): Promise<Record<string, any> | null> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return null;
    const notification = await delegate.findUnique({ where: { id } });
    if (!notification || (userId && notification.userId !== userId)) return null;
    return notification;
  }

  async findByUserId(userId: string, cursor?: string, limit = 20): Promise<Record<string, any>[]> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return [];
    const where: Record<string, any> = { userId };
    if (cursor) where.createdAt = { lt: cursor };
    return delegate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
  }

  async countUnread(userId: string): Promise<number> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return 0;
    return delegate.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return false;

    // Ownership is part of the write predicate rather than a preceding read.
    // The read-then-write form left a window in which the row could change
    // between check and update, and cost an extra query on every call.
    const result = await delegate.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return 0;
    const result = await delegate.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const delegate = this.prismaAny().notification;
    if (!delegate) return false;

    const result = await delegate.deleteMany({ where: { id, userId } });
    return result.count > 0;
  }

  async getPreferences(userId: string): Promise<Record<string, any> | null> {
    const delegate = this.prismaAny().notificationPreference;
    if (!delegate) return null;
    return delegate.findUnique({ where: { userId } });
  }

  async upsertPreferences(userId: string, data: Record<string, any>): Promise<Record<string, any>> {
    const delegate = this.prismaAny().notificationPreference;
    if (!delegate) throw new Error('NotificationPreference model not available');
    return delegate.upsert({
      where: { userId },
      update: { ...data, updatedAt: new Date() },
      create: { userId, ...data },
    });
  }
}
