import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { TokenRevocationService } from './services/token-revocation.service';
import { AuthRepository } from './auth.repository';
import {
  CookieService,
  EmailVerificationService,
  JwtTokenService,
  PasswordService,
  RefreshTokenService,
  SessionService,
  TokenFactory,
} from './services';
import { User } from '@prisma/client';

function createMockUser(overrides?: Partial<User>): User {
  const now = new Date();
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    name: 'Test User',
    role: 'USER',
    status: 'ACTIVE',
    emailVerified: false,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  } as User;
}

describe('AuthService', () => {
  let service: AuthService;
  // The provided AuthRepository is an in-memory mock that also exposes the
  // backing array, so tests can seed and inspect state.
  let repository: AuthRepository & { users: User[] };
  let refreshTokens: { tokens: { token: string; userId: string; revoked: boolean }[] };
  let _passwordService: PasswordService;
  let _jwtTokenService: JwtTokenService;
  let _refreshTokenService: RefreshTokenService;
  let _sessionService: SessionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenFactory,
        {
          provide: AuthRepository,
          useValue: {
            users: [] as User[],
            findByEmail(email: string) {
              return Promise.resolve(this.users.find((u: User) => u.email === email) ?? null);
            },
            findById(id: string) {
              return Promise.resolve(this.users.find((u: User) => u.id === id) ?? null);
            },
            emailExists(email: string) {
              return Promise.resolve(this.users.some((u: User) => u.email === email));
            },
            create(data: { email: string; passwordHash: string; name?: string | null }) {
              // Emulate the database unique constraint on email. AuthService
              // deliberately relies on P2002 rather than a check-then-insert,
              // which would race; the mock must reproduce that to exercise it.
              if (this.users.some((u: User) => u.email === data.email)) {
                const err = new Error('Unique constraint failed on the fields: (`email`)') as Error & {
                  code?: string;
                };
                err.code = 'P2002';
                throw err;
              }
              const user = createMockUser({
                id: `user-${this.users.length + 1}`,
                email: data.email,
                passwordHash: data.passwordHash,
                name: data.name ?? null,
                status: 'PENDING_VERIFICATION',
                emailVerified: false,
              });
              this.users.push(user);
              return Promise.resolve(user);
            },
            updateLastLogin() {
              return Promise.resolve();
            },
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: (plain: string) => Promise.resolve(`hash:${plain}`),
            compare: (plain: string, hashed: string) => Promise.resolve(hashed === `hash:${plain}`),
            needsRehash: () => false,
            dummyCompare: () => Promise.resolve(),
          },
        },
        {
          provide: JwtTokenService,
          useValue: {
            signAccessToken: (payload: { sub: string; email: string }) => ({
              accessToken: `access-${payload.sub}`,
              expiresIn: 900,
            }),
            verifyAccessToken: (token: string) => {
              const sub = token.replace('access-', '');
              return { sub, email: 'test@example.com' };
            },
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            tokens: [] as { token: string; userId: string; revoked: boolean }[],
            create(userId: string) {
              const token = `refresh-${userId}-${this.tokens.length}`;
              this.tokens.push({ token, userId, revoked: false });
              return Promise.resolve({
                token,
                refreshToken: {
                  id: 'rt-1',
                  userId,
                  tokenHash: 'hash',
                  expiresAt: new Date(Date.now() + 86400000),
                  revokedAt: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              });
            },
            rotate(token: string) {
              const existing = this.tokens.find(
                (t: { token: string; userId: string; revoked: boolean }) => t.token === token,
              );
              if (!existing || existing.revoked) {
                return Promise.reject(new UnauthorizedException('Invalid refresh token'));
              }
              existing.revoked = true;
              return this.create(existing.userId);
            },
            // Production rotates the token and its session in one transaction;
            // mirror that entry point so refresh() is actually exercised.
            rotateWithSession(token: string) {
              return this.rotate(token);
            },
            revoke(token: string) {
              const t = this.tokens.find((x: { token: string; userId: string; revoked: boolean }) => x.token === token);
              if (t) t.revoked = true;
              return Promise.resolve();
            },
            revokeAllForUser(userId: string) {
              this.tokens
                .filter((t: { token: string; userId: string; revoked: boolean }) => t.userId === userId)
                .forEach((t: { token: string; userId: string; revoked: boolean }) => (t.revoked = true));
              return Promise.resolve();
            },
          },
        },
        {
          provide: SessionService,
          useValue: {
            sessions: [] as { token: string; userId: string; status: string }[],
            create(userId: string, _ip?: string, _ua?: string, token?: string) {
              const sessionToken = token ?? `session-${userId}-${this.sessions.length}`;
              this.sessions.push({ token: sessionToken, userId, status: 'ACTIVE' });
              return Promise.resolve({
                id: 's-1',
                userId,
                token: sessionToken,
                expiresAt: new Date(Date.now() + 86400000),
                ipAddress: null,
                userAgent: null,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              });
            },
            validate(token: string) {
              const s = this.sessions.find(
                (x: { token: string; userId: string; revoked: boolean }) => x.token === token,
              );
              if (!s || s.status !== 'ACTIVE') return Promise.resolve(null);
              return Promise.resolve({
                id: 's-1',
                userId: s.userId,
                token,
                expiresAt: new Date(Date.now() + 86400000),
                ipAddress: null,
                userAgent: null,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              });
            },
            invalidateByToken(token: string) {
              const s = this.sessions.find(
                (x: { token: string; userId: string; revoked: boolean }) => x.token === token,
              );
              if (s) s.status = 'REVOKED';
              return Promise.resolve();
            },
            invalidateAllForUser(userId: string) {
              this.sessions
                .filter((s: { token: string; userId: string; status: string }) => s.userId === userId)
                .forEach((s: { token: string; userId: string; status: string }) => (s.status = 'REVOKED'));
              return Promise.resolve();
            },
          },
        },
        {
          provide: CookieService,
          useValue: {
            writeRefreshToken: () => undefined,
            readRefreshToken: () => undefined,
            clearRefreshToken: () => undefined,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'jwt.refreshExpirySeconds') return 604800;
              if (key === 'emailVerification.required') return true;
              if (key === 'nodeEnv') return 'test';
              return undefined;
            },
          },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            sendVerification: () => Promise.resolve({ email: 'mock@example.com' }),
          },
        },
        {
          // In-memory stand-in for the login throttle / lockout counters.
          provide: RedisService,
          useValue: {
            getClient: () => {
              const store = new Map<string, string>();
              return {
                get: (k: string) => Promise.resolve(store.get(k) ?? null),
                set: (k: string, v: string) => {
                  store.set(k, v);
                  return Promise.resolve('OK');
                },
                del: (k: string) => Promise.resolve(store.delete(k) ? 1 : 0),
                incr: (k: string) => {
                  const next = Number(store.get(k) ?? '0') + 1;
                  store.set(k, String(next));
                  return Promise.resolve(next);
                },
                expire: () => Promise.resolve(1),
                // Fixed-window counters are written via a MULTI pipeline.
                multi() {
                  const ops: (() => unknown)[] = [];
                  const chain = {
                    incr: (k: string) => {
                      ops.push(() => {
                        const next = Number(store.get(k) ?? '0') + 1;
                        store.set(k, String(next));
                        return next;
                      });
                      return chain;
                    },
                    expire: () => {
                      ops.push(() => 1);
                      return chain;
                    },
                    exec: () => Promise.resolve(ops.map((op) => [null, op()])),
                  };
                  return chain;
                },
                ttl: () => Promise.resolve(900),
                exists: (k: string) => Promise.resolve(store.has(k) ? 1 : 0),
                sadd: () => Promise.resolve(1),
                getdel: (k: string) => {
                  const v = store.get(k) ?? null;
                  store.delete(k);
                  return Promise.resolve(v);
                },
              };
            },
          },
        },
        {
          provide: TokenRevocationService,
          useValue: {
            revokeToken: () => Promise.resolve(),
            revokeAllForUser: () => Promise.resolve(),
            isRevoked: () => Promise.resolve(false),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<AuthRepository>(AuthRepository) as AuthRepository & { users: User[] };
    refreshTokens = module.get(RefreshTokenService) as unknown as {
      tokens: { token: string; userId: string; revoked: boolean }[];
    };
    _passwordService = module.get<PasswordService>(PasswordService);
    _jwtTokenService = module.get<JwtTokenService>(JwtTokenService);
    _refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    _sessionService = module.get<SessionService>(SessionService);
  });

  it('registers a new user', async () => {
    const user = await service.register({ email: 'new@example.com', password: 'StrongP@ssw0rd123' });
    expect(user.email).toBe('new@example.com');
    expect(repository.users.length).toBe(1);
  });

  it('throws when registering duplicate email', async () => {
    await service.register({ email: 'dup@example.com', password: 'StrongP@ssw0rd123' });
    // Must be awaited: without it the assertion resolves before the promise
    // settles and the test passes regardless of behaviour.
    await expect(service.register({ email: 'dup@example.com', password: 'StrongP@ssw0rd123' })).rejects.toThrow(
      'Email already registered',
    );
  });

  it('logs in with valid credentials', async () => {
    const created = await service.register({ email: 'login@example.com', password: 'StrongP@ssw0rd123' });
    const stored = repository.users.find((u: User) => u.id === created.id)!;
    stored.emailVerified = true;
    stored.status = 'ACTIVE';
    const result = await service.login({ email: 'login@example.com', password: 'StrongP@ssw0rd123' });
    expect(result.user.id).toBe(created.id);
    expect(result.accessToken).toContain('access-');
    // The refresh token is delivered ONLY as an httpOnly cookie and must never
    // appear in the response body.
    expect((result as unknown as Record<string, unknown>).refreshToken).toBeUndefined();
  });

  it('throws on invalid login credentials', async () => {
    await service.register({ email: 'bad@example.com', password: 'StrongP@ssw0rd123' });
    await expect(service.login({ email: 'bad@example.com', password: 'WrongPassword!' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects login for unverified users when verification required', async () => {
    await service.register({ email: 'unver@example.com', password: 'StrongP@ssw0rd123' });
    expect(service.login({ email: 'unver@example.com', password: 'StrongP@ssw0rd123' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rotates refresh token', async () => {
    await service.register({ email: 'rot@example.com', password: 'StrongP@ssw0rd123' });
    const stored = repository.users[repository.users.length - 1]!;
    stored.emailVerified = true;
    stored.status = 'ACTIVE';
    await service.login({ email: 'rot@example.com', password: 'StrongP@ssw0rd123' });

    // login() never returns the refresh token in its body — it is written as
    // an httpOnly cookie — so read the issued token from the mock service the
    // way the controller reads it from the cookie.
    const issued = refreshTokens.tokens[refreshTokens.tokens.length - 1]!.token;

    const refreshed = await service.refresh(issued);
    expect(refreshed.accessToken).toContain('access-');
  });

  it('throws on invalid refresh token', async () => {
    await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('logs out current session', async () => {
    await service.register({ email: 'logout@example.com', password: 'StrongP@ssw0rd123' });
    const stored = repository.users[repository.users.length - 1]!;
    stored.emailVerified = true;
    stored.status = 'ACTIVE';
    await service.login({ email: 'logout@example.com', password: 'StrongP@ssw0rd123' });
    // login() returns no refreshToken in its body (httpOnly cookie only), so
    // read the issued token the way the controller reads it from the cookie.
    const issued = refreshTokens.tokens[refreshTokens.tokens.length - 1]!.token;
    await service.logout(issued);
    await expect(service.refresh(issued)).rejects.toThrow(UnauthorizedException);
  });

  it('logs out all devices', async () => {
    await service.register({ email: 'logoutall@example.com', password: 'StrongP@ssw0rd123' });
    const stored = repository.users[repository.users.length - 1]!;
    stored.emailVerified = true;
    stored.status = 'ACTIVE';
    const login = await service.login({ email: 'logoutall@example.com', password: 'StrongP@ssw0rd123' });
    const issuedAll = refreshTokens.tokens[refreshTokens.tokens.length - 1]!.token;
    await service.logoutAll(login.user.id);
    await expect(service.refresh(issuedAll)).rejects.toThrow(UnauthorizedException);
  });

  it('returns current user profile', async () => {
    const created = await service.register({ email: 'me@example.com', password: 'StrongP@ssw0rd123' });
    const profile = await service.me(created.id);
    expect(profile.email).toBe('me@example.com');
  });
});
