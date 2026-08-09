import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { SharedModule } from '../shared';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './journal.repository';
import { JournalEventService } from './journal-event.service';
import { TimelineEventFactory } from './timeline-event-factory';
import { JournalStatisticsService } from './journal-statistics.service';
import { PromptService } from './prompt.service';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [JournalController],
  providers: [
    JournalService,
    JournalRepository,
    JournalEventService,
    TimelineEventFactory,
    JournalStatisticsService,
    PromptService,
  ],
  exports: [JournalService, JournalRepository],
})
export class JournalModule {}
