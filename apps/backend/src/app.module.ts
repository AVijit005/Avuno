import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from './config/config.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { BullmqModule } from './bullmq/bullmq.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth';
import { LibraryModule } from './library';
import { MediaModule } from './media';
import { ProgressModule } from './progress';
import { InteractionModule } from './interaction';
import { CollectionsModule } from './collections';
import { JournalModule } from './journal';
import { SearchModule } from './search';
import { AnalyticsModule } from './analytics';
import { WrappedModule } from './wrapped';
import { NotificationsModule } from './notifications';
import { StorageModule } from './storage';
import { ObservabilityModule } from './observability';
import { HardeningModule } from './hardening';
import { DeploymentModule } from './deployment';

import { SharedModule } from './shared';
import { UsersModule } from './users/users.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (config: ConfigService, redis: RedisService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
            limit: config.get<number>('RATE_LIMIT_GLOBAL', 100),
          },
        ],
        // Without an explicit storage the throttler keeps counters in a
        // per-process Map, so limits multiplied by replica count and reset on
        // every deploy.
        storage: new RedisThrottlerStorage(redis),
      }),
    }),
    LoggerModule,
    PrismaModule,
    RedisModule,
    BullmqModule,
    HealthModule,
    SharedModule,
    AuthModule,
    LibraryModule,
    MediaModule,
    ProgressModule,
    InteractionModule,
    CollectionsModule,
    JournalModule,
    SearchModule,
    AnalyticsModule,
    WrappedModule,
    NotificationsModule,
    StorageModule,
    ObservabilityModule,
    HardeningModule,
    DeploymentModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: validationPipe,
    },
  ],
})
export class AppModule {}
