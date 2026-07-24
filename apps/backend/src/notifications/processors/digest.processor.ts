import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUE_NOTIFICATION } from '../notification-queue.service';
import { NotificationsRepository } from '../notifications.repository';
import { DigestService } from '../digest.service';

@Processor(QUEUE_NOTIFICATION)
export class DigestProcessor extends WorkerHost {
  private readonly logger = new Logger(DigestProcessor.name);

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly digestService: DigestService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { userId, type } = job.data;
    this.logger.debug(`Processing digest: user=${userId} type=${type}`);

    if (type === 'weekly') {
      const digest = await this.digestService.generateWeeklyDigest(userId);
      await this.repository.create({
        userId,
        title: 'Your Weekly Chronicle Digest',
        body: digest,
        type: 'SYSTEM',
      });
    } else if (type === 'monthly') {
      const digest = await this.digestService.generateMonthlyDigest(userId);
      await this.repository.create({
        userId,
        title: 'Your Monthly Chronicle Report',
        body: digest,
        type: 'SYSTEM',
      });
    }
  }
}
