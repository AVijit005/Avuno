import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { SharedModule } from '../shared';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { DashboardService } from './dashboard.service';
import { StreakService } from './streak.service';
import { InsightsService } from './insights.service';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AnalyticsController],
  providers: [
    DiscoveryService,
    AnalyticsService,
    AnalyticsRepository,
    AnalyticsAggregationService,
    DashboardService,
    StreakService,
    InsightsService,
  ],
  exports: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}
