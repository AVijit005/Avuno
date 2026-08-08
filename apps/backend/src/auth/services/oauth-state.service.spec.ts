import { describe, it, expect, beforeEach } from 'bun:test';
import { OAuthStateService } from './oauth-state.service';
import type { RedisService } from '../../redis/redis.service';

/**
 * Minimal in-memory Redis stub covering the commands this service uses.
 * `getdel` is modelled faithfully because single-use semantics are the whole
 * point of the state check.
 */
class FakeRedis {
  store = new Map<string, string>();
  /** Set true to emulate Redis < 6.2, where GETDEL does not exist. */
  supportsGetDel = true;
  getDelCalls = 0;

  async set(key: string, value: string, _mode: string, _ttl: number): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async getdel(key: string): Promise<string | null> {
    this.getDelCalls++;
    if (!this.supportsGetDel) {
      throw new Error("ERR unknown command 'GETDEL'");
    }
    const value = this.store.get(key) ?? null;
    this.store.delete(key);
    return value;
  }
}

function createService(redis: FakeRedis): OAuthStateService {
  return new OAuthStateService({ getClient: () => redis } as unknown as RedisService);
}

describe('OAuthStateService', () => {
  let redis: FakeRedis;
  let service: OAuthStateService;

  beforeEach(() => {
    redis = new FakeRedis();
    service = createService(redis);
  });

  describe('state', () => {
    it('round-trips a state it issued', async () => {
      const state = await service.createState('https://www.avuno.xyz');
      const payload = await service.consumeState(state);
      expect(payload).toEqual({ returnTo: 'https://www.avuno.xyz' });
    });

    it('issues an unguessable, non-repeating state', async () => {
      const a = await service.createState('https://www.avuno.xyz');
      const b = await service.createState('https://www.avuno.xyz');
      expect(a).not.toBe(b);
      expect(a).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('rejects a state that was never issued (login CSRF)', async () => {
      // An attacker who completes Google consent with their own account and
      // replays the callback at a victim has no valid state to present.
      expect(await service.consumeState('11111111-2222-3333-4444-555555555555')).toBeNull();
    });

    it('rejects a missing state', async () => {
      expect(await service.consumeState(undefined)).toBeNull();
      expect(await service.consumeState('')).toBeNull();
    });

    it('consumes state exactly once (no replay)', async () => {
      const state = await service.createState('https://www.avuno.xyz');
      expect(await service.consumeState(state)).not.toBeNull();
      expect(await service.consumeState(state)).toBeNull();
    });

    it('falls back to GET+DEL when the server has no GETDEL', async () => {
      redis.supportsGetDel = false;
      const state = await service.createState('https://www.avuno.xyz');

      expect(await service.consumeState(state)).toEqual({ returnTo: 'https://www.avuno.xyz' });
      // Still single-use on the fallback path.
      expect(await service.consumeState(state)).toBeNull();
    });

    it('rejects a state whose payload is corrupt rather than throwing', async () => {
      redis.store.set('oauth:state:broken', '{not json');
      expect(await service.consumeState('broken')).toBeNull();
    });

    it('stores state with a bounded TTL', async () => {
      let capturedTtl: number | undefined;
      const spy = {
        ...redis,
        set: async (_k: string, _v: string, _mode: string, ttl: number) => {
          capturedTtl = ttl;
          return 'OK' as const;
        },
      };
      const svc = createService(spy as unknown as FakeRedis);
      await svc.createState('https://www.avuno.xyz');
      expect(capturedTtl).toBe(300);
    });
  });

  describe('code', () => {
    it('stores the auth result behind an opaque single-use code', async () => {
      const code = await service.createCode({
        user: { id: 'u1' },
        accessToken: 'jwt-token',
        expiresIn: 900,
        refreshToken: 'refresh-token',
      });

      expect(code).toMatch(/^[0-9a-f-]{36}$/);
      // The token is in Redis, never in the redirect URL.
      const raw = redis.store.get(`oauth:code:${code}`);
      expect(raw).toBeDefined();
      expect(JSON.parse(raw as string).accessToken).toBe('jwt-token');
    });

    it('stores the code with a short TTL', async () => {
      let capturedTtl: number | undefined;
      const spy = {
        ...redis,
        set: async (_k: string, _v: string, _mode: string, ttl: number) => {
          capturedTtl = ttl;
          return 'OK' as const;
        },
      };
      const svc = createService(spy as unknown as FakeRedis);
      await svc.createCode({ user: {}, accessToken: 't', expiresIn: 900 });
      expect(capturedTtl).toBe(30);
    });
  });
});
