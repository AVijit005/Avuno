import { describe, it, expect, beforeEach } from 'bun:test';
import { RedisThrottlerStorage } from './redis-throttler.storage';
import type { RedisService } from '../../redis/redis.service';

/**
 * Minimal Redis stub covering the commands the storage uses, including the
 * `expire ... NX` semantics that make the window fixed rather than sliding.
 */
class FakeRedis {
  store = new Map<string, { value: string; expiresAt: number | null }>();
  failing = false;
  now = 1_000_000;

  private guard() {
    if (this.failing) throw new Error('ECONNREFUSED');
  }

  private live(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  async ttl(key: string): Promise<number> {
    this.guard();
    const entry = this.live(key);
    if (!entry) return -2;
    if (entry.expiresAt === null) return -1;
    return Math.ceil((entry.expiresAt - this.now) / 1000);
  }

  async set(key: string, value: string, _mode: string, seconds: number) {
    this.guard();
    this.store.set(key, { value, expiresAt: this.now + seconds * 1000 });
    return 'OK' as const;
  }

  multi() {
    const ops: (() => unknown)[] = [];
    const chain = {
      incr: (key: string) => {
        ops.push(() => {
          this.guard();
          const entry = this.live(key);
          const next = Number(entry?.value ?? '0') + 1;
          this.store.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
          return next;
        });
        return chain;
      },
      expire: (key: string, seconds: number, mode?: string) => {
        ops.push(() => {
          this.guard();
          const entry = this.live(key);
          if (!entry) return 0;
          // NX: only set a TTL when none exists. This is what keeps the
          // window fixed instead of sliding forward on every hit.
          if (mode === 'NX' && entry.expiresAt !== null) return 0;
          entry.expiresAt = this.now + seconds * 1000;
          return 1;
        });
        return chain;
      },
      exec: async () => ops.map((op) => [null, op()] as [null, unknown]),
    };
    return chain;
  }
}

function createStorage(redis: FakeRedis) {
  return new RedisThrottlerStorage({ getClient: () => redis } as unknown as RedisService);
}

const TTL_MS = 60_000;
const LIMIT = 3;
const BLOCK_MS = 60_000;

describe('RedisThrottlerStorage', () => {
  let redis: FakeRedis;
  let storage: RedisThrottlerStorage;

  beforeEach(() => {
    redis = new FakeRedis();
    storage = createStorage(redis);
  });

  const hit = () => storage.increment('1.2.3.4', TTL_MS, LIMIT, BLOCK_MS, 'global');

  it('counts hits within the window', async () => {
    expect((await hit()).totalHits).toBe(1);
    expect((await hit()).totalHits).toBe(2);
    expect((await hit()).totalHits).toBe(3);
  });

  it('does not block while under the limit', async () => {
    await hit();
    const record = await hit();
    expect(record.isBlocked).toBe(false);
  });

  it('blocks once the limit is exceeded', async () => {
    for (let i = 0; i < LIMIT; i++) await hit();
    const record = await hit();
    expect(record.isBlocked).toBe(true);
    expect(record.timeToBlockExpire).toBeGreaterThan(0);
  });

  it('keeps blocking while the block is live', async () => {
    for (let i = 0; i <= LIMIT; i++) await hit();
    const record = await hit();
    expect(record.isBlocked).toBe(true);
  });

  it('uses a fixed window: the TTL does not slide with each hit', async () => {
    await hit();
    const initialTtl = await redis.ttl('throttle:hits:global:1.2.3.4');

    redis.now += 30_000;
    await hit();
    const laterTtl = await redis.ttl('throttle:hits:global:1.2.3.4');

    // With a sliding window this would be back at ~60. It should have
    // decreased instead, otherwise a steady trickle holds the window open
    // forever.
    expect(laterTtl).toBeLessThan(initialTtl);
  });

  it('starts a fresh window after the previous one expires', async () => {
    for (let i = 0; i <= LIMIT; i++) await hit();
    expect((await hit()).isBlocked).toBe(true);

    redis.now += 120_000; // past both the window and the block
    const record = await hit();
    expect(record.isBlocked).toBe(false);
    expect(record.totalHits).toBe(1);
  });

  it('separates different keys', async () => {
    for (let i = 0; i <= LIMIT; i++) await hit();
    const other = await storage.increment('5.6.7.8', TTL_MS, LIMIT, BLOCK_MS, 'global');
    expect(other.isBlocked).toBe(false);
  });

  it('separates different throttlers for the same key', async () => {
    for (let i = 0; i <= LIMIT; i++) await hit();
    const other = await storage.increment('1.2.3.4', TTL_MS, LIMIT, BLOCK_MS, 'login');
    expect(other.isBlocked).toBe(false);
  });

  it('fails open when Redis is unavailable', async () => {
    redis.failing = true;
    // Rate limiting is availability protection, not authorization: a Redis
    // outage must not turn into a total outage.
    const record = await hit();
    expect(record.isBlocked).toBe(false);
  });
});
