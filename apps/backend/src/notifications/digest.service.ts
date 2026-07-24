import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsRepository } from '../analytics/analytics.repository';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(private readonly analyticsRepo: AnalyticsRepository) {}

  async generateWeeklyDigest(userId: string): Promise<string> {
    const [completed, total, avgRating] = await Promise.all([
      this.analyticsRepo.countCompletedByType(userId),
      this.analyticsRepo.getTotalLibraryItems(userId),
      this.analyticsRepo.getAverageRating(userId),
    ]);

    const totalCompleted = Object.values(completed).reduce((a, b) => a + b, 0);
    const lines: string[] = [`This week you completed ${totalCompleted} item${totalCompleted !== 1 ? 's' : ''}.`];

    if (completed['movie']) lines.push(`Movies completed: ${completed['movie']}`);
    if (completed['book']) lines.push(`Books read: ${completed['book']}`);
    if (completed['tvShow']) lines.push(`TV shows finished: ${completed['tvShow']}`);
    if (avgRating) lines.push(`Average rating: ${avgRating.toFixed(1)}/5`);
    lines.push(`Total library: ${total} item${total !== 1 ? 's' : ''}`);

    return lines.join('\n');
  }

  async generateMonthlyDigest(userId: string): Promise<string> {
    const [completed, _total, avgRating, journalDates] = await Promise.all([
      this.analyticsRepo.countCompletedByType(userId),
      this.analyticsRepo.getTotalLibraryItems(userId),
      this.analyticsRepo.getAverageRating(userId),
      this.analyticsRepo.getJournalEntryDates(userId, 1000),
    ]);

    const totalCompleted = Object.values(completed).reduce((a, b) => a + b, 0);
    const lines: string[] = [
      `📊 Monthly Chronicle Report`,
      ``,
      `This month you completed ${totalCompleted} item${totalCompleted !== 1 ? 's' : ''}.`,
    ];

    if (completed['movie']) lines.push(`🎬 Movies: ${completed['movie']}`);
    if (completed['tvShow']) lines.push(`📺 TV Shows: ${completed['tvShow']}`);
    if (completed['anime']) lines.push(`🎌 Anime: ${completed['anime']}`);
    if (completed['book']) lines.push(`📚 Books: ${completed['book']}`);
    if (completed['game']) lines.push(`🎮 Games: ${completed['game']}`);
    if (completed['course']) lines.push(`📖 Courses: ${completed['course']}`);
    if (avgRating) lines.push(`⭐ Average rating: ${avgRating.toFixed(1)}/5`);
    if (journalDates.length > 0) lines.push(`📝 Journal entries: ${journalDates.length}`);

    return lines.join('\n');
  }
}
