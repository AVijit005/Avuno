import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repoMock: {
    findByUserId: ReturnType<typeof mock>;
    countUnread: ReturnType<typeof mock>;
    findById: ReturnType<typeof mock>;
    markAsRead: ReturnType<typeof mock>;
    markAllAsRead: ReturnType<typeof mock>;
    delete: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    getPreferences: ReturnType<typeof mock>;
    upsertPreferences: ReturnType<typeof mock>;
  };
  let queueMock: Record<string, ReturnType<typeof mock>>;

  const mockNotif = {
    id: 'n-1',
    userId: 'user-1',
    title: 'Test',
    body: 'Body',
    type: 'SYSTEM',
    isRead: false,
    actionUrl: null,
    image: null,
    createdAt: new Date('2024-01-01'),
    readAt: null,
  };

  beforeEach(() => {
    repoMock = {
      findByUserId: mock(() => Promise.resolve([{ ...mockNotif }])),
      countUnread: mock(() => Promise.resolve(1)),
      findById: mock(() => Promise.resolve({ ...mockNotif })),
      markAsRead: mock(() => Promise.resolve(true)),
      markAllAsRead: mock(() => Promise.resolve(3)),
      delete: mock(() => Promise.resolve(true)),
      create: mock(() => Promise.resolve({ ...mockNotif })),
      getPreferences: mock(() => Promise.resolve(null)),
      upsertPreferences: mock(() =>
        Promise.resolve({
          emailEnabled: true,
          pushEnabled: true,
          browserEnabled: true,
          marketingEnabled: false,
          weeklyWrapped: true,
          monthlyReport: true,
          friendActivity: true,
          reminders: true,
        }),
      ),
    };
    queueMock = {
      getQueueMetrics: mock(() => Promise.resolve({})),
    };

    service = new NotificationsService(repoMock as any, queueMock as any);
  });

  it('lists notifications', async () => {
    const result = await service.findAll('user-1');
    expect(result.items).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
  });

  it('marks a notification as read', async () => {
    const result = await service.markAsRead('n-1', 'user-1');
    expect(result.title).toBe('Test');
  });

  it('marks all as read', async () => {
    const result = await service.markAllAsRead('user-1');
    expect(result.count).toBe(3);
  });

  it('deletes a notification', async () => {
    await service.remove('n-1', 'user-1');
    expect(repoMock.delete).toHaveBeenCalledWith('n-1', 'user-1');
  });

  it('returns default preferences when none exist', async () => {
    const result = await service.getPreferences('user-1');
    expect(result.emailEnabled).toBe(true);
  });

  it('sends a test notification', async () => {
    const result = await service.sendTest('user-1', 'Test', 'Body');
    expect(result.title).toBe('Test');
  });
});
