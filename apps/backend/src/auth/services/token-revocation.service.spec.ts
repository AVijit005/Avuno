import { describe, it, expect, beforeEach } from 'bun:test';
import { TokenRevocationService } from './token-revocation.service';
import type { RedisService } from '../../redis/redis.service';
import type { ConfigService } from '@nestjs/config';

class FakeRedis {
  store = new Map<string, string>();
  /** Set true to simulate Redis being unreachable. */
  failing = false;

  private guard() {
    if (this.failing) throw new Error('ECONNREFUSED');
  }

  async set(key: string, value: string, _mode: string, _ttl: number): Promise<'OK'> {
    this.guard();
    this.store.set(key, value);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    this.guard();
    return this.store.get(key) ?? null;
  }

  async exists(key: string): Promise<number> {
    this.guard();
    return this.store.has(key) ? 1 : 0;
  }
}

function createService(redis: FakeRedis, accessTtl = 900): TokenRevocationService {
  const config = { get: () => accessTtl } as unknown as ConfigService;
  return new TokenRevocationService({ getClient: () => redis } as unknown as RedisService, config);
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('TokenRevocationService', () => {
  let redis: FakeRedis;
  let service: TokenRevocationService;

  beforeEach(() => {
    redis = new FakeRedis();
    service = createService(redis);
  });

  describe('per-token revocation', () => {
    it('treats an untouched token as valid', async () => {
      expect(await service.isRevoked({ jti: 'jti-1', sub: 'u1', iat: nowSeconds() })).toBe(false);
    });

    it('rejects a token after it is revoked', async () => {
      await service.revokeToken('jti-1');
      expect(await service.isRevoked({ jti: 'jti-1', sub: 'u1', iat: nowSeconds() })).toBe(true);
    });

    it('does not revoke unrelated tokens', async () => {
      await service.revokeToken('jti-1');
      expect(await service.isRevoked({ jti: 'jti-2', sub: 'u1', iat: nowSeconds() })).toBe(false);
    });

    it('scopes the denylist TTL to the token remaining life', async () => {
      let captured: number | undefined;
      const spy = {
        ...redis,
        set: async (_k: string, _v: string, _m: string, ttl: number) => {
          captured = ttl;
          return 'OK' as const;
        },
      };
      const svc = createService(spy as unknown as FakeRedis);
      await svc.revokeToken('jti-1', nowSeconds() + 120);
      // ~120s, allowing for clock granularity.
      expect(captured).toBeGreaterThan(100);
      expect(captured).toBeLessThanOrEqual(120);
    });
  });

  describe('per-user revocation (logout everywhere)', () => {
    it('rejects tokens issued before the revocation epoch', async () => {
      const issuedAt = nowSeconds() - 60;
      await service.revokeAllForUser('u1');
      expect(await service.isRevoked({ jti: 'any', sub: 'u1', iat: issuedAt })).toBe(true);
    });

    it('accepts tokens issued after the revocation epoch', async () => {
      await service.revokeAllForUser('u1');
      const reissuedAt = nowSeconds() + 5;
      expect(await service.isRevoked({ jti: 'fresh', sub: 'u1', iat: reissuedAt })).toBe(false);
    });

    it('rejects a token minted in the same second as the revocation', async () => {
      // iat has one-second granularity, so the cutoff must be exclusive of
      // the current second or a token issued "now" would survive logout-all.
      const iat = nowSeconds();
      await service.revokeAllForUser('u1');
      expect(await service.isRevoked({ jti: 'edge', sub: 'u1', iat })).toBe(true);
    });

    it('does not affect other users', async () => {
      await service.revokeAllForUser('u1');
      expect(await service.isRevoked({ jti: 'x', sub: 'u2', iat: nowSeconds() - 60 })).toBe(false);
    });
  });

  describe('resilience', () => {
    it('fails closed when Redis is unavailable', async () => {
      redis.failing = true;
      // An unreachable denylist is indistinguishable from an empty one.
      // Accepting the token would silently reinstate every revoked session.
      expect(await service.isRevoked({ jti: 'jti-1', sub: 'u1', iat: nowSeconds() })).toBe(true);
    });

    it('surfaces write failures instead of silently not revoking', async () => {
      redis.failing = true;
      await expect(service.revokeToken('jti-1')).rejects.toThrow();
      await expect(service.revokeAllForUser('u1')).rejects.toThrow();
    });

    it('handles a token with no jti (legacy, issued before this change)', async () => {
      expect(await service.isRevoked({ sub: 'u1', iat: nowSeconds() })).toBe(false);
      await service.revokeAllForUser('u1');
      expect(await service.isRevoked({ sub: 'u1', iat: nowSeconds() - 10 })).toBe(true);
    });
  });
});
