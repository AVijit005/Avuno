import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { AnalyticsRepository } from '../analytics/analytics.repository';

interface MediaWithTitle {
  title?: string;
}

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly analyticsRepo: AnalyticsRepository,
  ) {}

  async sendDailyReminder(userId: string): Promise<void> {
    // Check if user has in-progress items to remind about
    const ongoing = await this.analyticsRepo.getInProgressByType(userId, 'movie', ['WATCHING'], 1);
    const reading = await this.analyticsRepo.getInProgressByType(userId, 'book', ['READING'], 1);
    const playing = await this.analyticsRepo.getInProgressByType(userId, 'game', ['PLAYING'], 1);

    const parts: string[] = [];
    if (ongoing.length > 0) parts.push('continue watching');
    if (reading.length > 0) parts.push('continue reading');
    if (playing.length > 0) parts.push('continue playing');

    if (parts.length === 0) return;

    await this.notificationsRepo.create({
      userId,
      title: 'Daily Reminder',
      body: `Don't forget to ${parts.join(', ')} today!`,
      type: 'REMINDER',
    });
  }

  async sendContinueWatchingReminder(userId: string): Promise<void> {
    const items = await this.analyticsRepo.getInProgressByType(userId, 'movie', ['WATCHING'], 3);
    if (items.length === 0) return;

    const titles = items.map((i) => (i as { movie?: MediaWithTitle }).movie?.title ?? 'Unknown').join(', ');
    await this.notificationsRepo.create({
      userId,
      title: 'Continue Watching',
      body: `You have ${items.length} show${items.length > 1 ? 's' : ''} in progress: ${titles}`,
      type: 'REMINDER',
    });
  }

  async sendContinueReadingReminder(userId: string): Promise<void> {
    const items = await this.analyticsRepo.getInProgressByType(userId, 'book', ['READING'], 3);
    if (items.length === 0) return;

    const titles = items.map((i) => (i as { book?: MediaWithTitle }).book?.title ?? 'Unknown').join(', ');
    await this.notificationsRepo.create({
      userId,
      title: 'Continue Reading',
      body: `Pick up where you left off with: ${titles}`,
      type: 'REMINDER',
    });
  }
}
