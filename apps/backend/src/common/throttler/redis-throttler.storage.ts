import { Injectable, Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { RedisService } from '../../redis/redis.service';

const HIT_PREFIX = 'throttle:hits:';
const BLOCK_PREFIX = 'throttle:block:';

/**
 * Redis-backed storage for @nestjs/throttler.
 *
 * The default ThrottlerStorageService keeps counters in a per-process Map.
 * With N API replicas the effective limit becomes N x limit, and every deploy
 * or restart resets every counter — so the rate limits protecting login,
 * registration and password reset were far weaker than configured, and
 * trivially reset by triggering a redeploy.
 *
 * Implemented directly against the ThrottlerStorage interface rather than
 * adding a third-party package: it is ~40 lines and avoids another dependency
 * in the auth path.
 */
@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const client = this.redis.getClient();
    const hitKey = `${HIT_PREFIX}${throttlerName}:${key}`;
    const blockKey = `${BLOCK_PREFIX}${throttlerName}:${key}`;

    // ttl and blockDuration arrive in milliseconds.
    const ttlSeconds = Math.max(1, Math.ceil(ttl / 1000));
    const blockSeconds = Math.max(1, Math.ceil(blockDuration / 1000));

    try {
      const blockTtl = await client.ttl(blockKey);
      if (blockTtl > 0) {
        return {
          totalHits: limit + 1,
          timeToExpire: blockTtl,
          isBlocked: true,
          timeToBlockExpire: blockTtl,
        };
      }

      // INCR then set the expiry only on first hit, so the window is fixed
      // rather than sliding. A sliding window lets a steady trickle of
      // requests hold a counter open indefinitely.
      const [[, totalHits]] = (await client.multi().incr(hitKey).expire(hitKey, ttlSeconds, 'NX').exec()) as [
        [Error | null, number],
        ...unknown[],
      ];

      if (totalHits > limit) {
        await client.set(blockKey, '1', 'EX', blockSeconds);
        return {
          totalHits,
          timeToExpire: blockSeconds,
          isBlocked: true,
          timeToBlockExpire: blockSeconds,
        };
      }

      const remaining = await client.ttl(hitKey);
      return {
        totalHits,
        timeToExpire: remaining > 0 ? remaining : ttlSeconds,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    } catch (error) {
      // Fail OPEN. Rate limiting is availability protection, not an
      // authorization control: if Redis is down, rejecting every request
      // would turn a cache outage into a full outage. The auth-specific
      // lockout in AuthService is the control that must fail closed.
      this.logger.error('Throttler storage unavailable; allowing request', error as Error);
      return { totalHits: 0, timeToExpire: ttlSeconds, isBlocked: false, timeToBlockExpire: 0 };
    }
  }
}
