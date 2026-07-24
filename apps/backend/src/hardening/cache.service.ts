import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import type { CacheService as ICacheService } from '../core';

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly prefix = 'chronicle:cache:';

  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await this.redis.getClient().get(this.prefix + key);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error(`Cache get failed for ${key}: ${error}`);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.getClient().setex(this.prefix + key, ttlSeconds, serialized);
    } catch (error) {
      this.logger.error(`Cache set failed for ${key}: ${error}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.getClient().del(this.prefix + key);
    } catch (error) {
      this.logger.error(`Cache delete failed for ${key}: ${error}`);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.getClient().exists(this.prefix + key);
      return exists === 1;
    } catch {
      return false;
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys(this.prefix + pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache clearPattern failed for ${pattern}: ${error}`);
    }
  }

  async flushAll(): Promise<void> {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys(this.prefix + '*');
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache flushAll failed: ${error}`);
    }
  }
}
