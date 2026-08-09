import { Module, MiddlewareConsumer } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PerformanceService } from './performance.service';
import { HealthMetricsService } from './health-metrics.service';
import { TracingService } from './tracing.service';
import { LoggingService } from './logging.service';
import { RequestMetricsMiddleware } from './request-metrics.middleware';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AuthModule supplies JwtAuthGuard and its dependencies for the
  // now admin-only MetricsController.
  imports: [RedisModule, AuthModule],
  controllers: [MetricsController],
  providers: [MetricsService, PerformanceService, HealthMetricsService, TracingService, LoggingService],
  exports: [MetricsService, PerformanceService, HealthMetricsService, TracingService, LoggingService],
})
export class ObservabilityModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMetricsMiddleware).forRoutes('*');
  }
}
