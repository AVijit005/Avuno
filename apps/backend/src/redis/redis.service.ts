import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new IORedis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port'),
      password: this.config.get<string>('redis.password') || undefined,
      db: this.config.get<number>('redis.db'),
      lazyConnect: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 500, 2000),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.ping();
      this.logger.log('Connected to Redis');
    } catch (err) {
      this.logger.error('Failed to connect to Redis on startup', err);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
