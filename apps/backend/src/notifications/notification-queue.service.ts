import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export const QUEUE_NOTIFICATION = 'notification';
export const QUEUE_EMAIL = 'email';
export const QUEUE_WRAPPED = 'wrapped';
export const QUEUE_ANALYTICS = 'analytics';
export const QUEUE_CLEANUP = 'cleanup';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NOTIFICATION) private readonly notificationQueue: Queue,
    @InjectQueue(QUEUE_WRAPPED) private readonly wrappedQueue: Queue,
    @InjectQueue(QUEUE_ANALYTICS) private readonly analyticsQueue: Queue,
    @InjectQueue(QUEUE_CLEANUP) private readonly cleanupQueue: Queue,
  ) {}

  async sendNotification(userId: string, title: string, body: string, type: string, actionUrl?: string): Promise<void> {
    await this.notificationQueue.add(
      'send-notification',
      { userId, title, body, type, actionUrl },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );
    this.logger.debug(`Queued notification for user=${userId} type=${type}`);
  }

  async scheduleWrappedGeneration(userId: string, year: number): Promise<void> {
    await this.wrappedQueue.add(
      'generate-wrapped',
      { userId, year },
      { attempts: 2, backoff: { type: 'exponential', delay: 2000 } },
    );
  }

  async refreshAnalytics(userId: string): Promise<void> {
    await this.analyticsQueue.add('refresh-analytics', { userId }, { attempts: 1 });
  }

  async scheduleCleanup(type: string): Promise<void> {
    await this.cleanupQueue.add(
      `cleanup-${type}`,
      { type },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
  }

  async getQueueMetrics(): Promise<Record<string, QueueMetrics>> {
    const queues = [this.notificationQueue, this.wrappedQueue, this.analyticsQueue, this.cleanupQueue];
    const names = [QUEUE_NOTIFICATION, QUEUE_WRAPPED, QUEUE_ANALYTICS, QUEUE_CLEANUP];
    const metrics: Record<string, QueueMetrics> = {};

    for (let i = 0; i < queues.length; i++) {
      const [waiting, active, completed, failed] = await Promise.all([
        queues[i].getWaitingCount(),
        queues[i].getActiveCount(),
        queues[i].getCompletedCount(),
        queues[i].getFailedCount(),
      ]);
      metrics[names[i]] = { waiting, active, completed, failed };
    }

    return metrics;
  }
}
