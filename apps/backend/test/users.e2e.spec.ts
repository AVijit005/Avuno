import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { JwtTokenService } from '../src/auth/services/jwt-token.service';
import { AppModule } from '../src/app.module';
import { STORAGE_SERVICE } from '../src/core/core.module';
import type { StorageFile, StorageService } from '../src/core/storage/storage.abstraction';
import { PrismaService } from '../src/prisma/prisma.service';

interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  timezone: string;
  language: string;
  dateFormat: string;
  themePreference: string;
  avatar: string | null;
  coverImage: string | null;
  preferences: Record<string, unknown> | null;
  privacy: Record<string, unknown> | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface MockRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockAuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue: unknown;
  newValue: unknown;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

function defaultUser(overrides: Partial<MockUser> = {}): MockUser {
  const now = new Date();
  return {
    id: 'user-default',
    email: 'user@example.com',
    passwordHash: 'hash',
    name: null,
    displayName: null,
    username: null,
    bio: null,
    location: null,
    website: null,
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    themePreference: 'system',
    avatar: null,
    coverImage: null,
    preferences: null,
    privacy: null,
    role: 'USER',
    status: 'ACTIVE',
    emailVerified: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function createInMemoryStorage(): StorageService & { files: Map<string, Buffer> } {
  const files = new Map<string, Buffer>();
  return {
    files,
    async upload(path: string, file: StorageFile): Promise<string> {
      files.set(path, Buffer.from(file.buffer));
      return path;
    },
    async download(path: string): Promise<Buffer> {
      const value = files.get(path);
      if (!value) throw new Error(`File not found: ${path}`);
      return value;
    },
    async delete(path: string): Promise<void> {
      files.delete(path);
    },
    async exists(path: string): Promise<boolean> {
      return files.has(path);
    },
  };
}

function createMockPrismaService(seed?: { user?: Partial<MockUser>; sessions?: MockSession[] }) {
  const users: MockUser[] = [];
  const sessions: MockSession[] = [];
  const refreshTokens: MockRefreshToken[] = [];
  const auditLogs: MockAuditLog[] = [];

  if (seed?.user) {
    users.push(defaultUser(seed.user));
  }
  if (seed?.sessions) {
    sessions.push(...seed.sessions);
  }

  let userCounter = 0;

  return {
    user: {
      findUnique: ({ where }: { where: { id?: string; email?: string; username?: string } }) => {
        const user = users.find((u) => {
          if (u.deletedAt) return false;
          if (where.id && u.id === where.id) return true;
          if (where.email && u.email === where.email) return true;
          if (where.username && u.username === where.username) return true;
          return false;
        });
        return Promise.resolve(user ?? null);
      },
      findFirst: ({ where }: { where: { username?: string; NOT?: { id: string }; id?: string } }) => {
        const user = users.find((u) => {
          if (u.deletedAt) return false;
          if (where.username && u.username !== where.username) return false;
          if (where.NOT?.id && u.id === where.NOT.id) return false;
          if (where.id && u.id !== where.id) return false;
          return true;
        });
        return Promise.resolve(user ?? null);
      },
      count: ({ where }: { where: { email?: string; id?: string } }) => {
        return Promise.resolve(
          users.filter(
            (u) => !u.deletedAt && (!where.email || u.email === where.email) && (!where.id || u.id === where.id),
          ).length,
        );
      },
      create: ({ data }: { data: Partial<MockUser> }) => {
        userCounter += 1;
        const user = defaultUser({ id: `user-${userCounter}`, ...data });
        users.push(user);
        return Promise.resolve(user);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<MockUser> }) => {
        const index = users.findIndex((u) => u.id === where.id);
        if (index === -1) throw new Error('User not found');
        users[index] = { ...users[index], ...data, updatedAt: new Date() };
        return Promise.resolve(users[index]);
      },
    },
    session: {
      create: ({ data }: { data: Partial<MockSession> }) => {
        const session: MockSession = {
          id: data.id ?? `session-${sessions.length + 1}`,
          userId: data.userId!,
          token: data.token!,
          expiresAt: data.expiresAt!,
          ipAddress: (data.ipAddress ?? null) as string | null,
          userAgent: (data.userAgent ?? null) as string | null,
          status: (data.status ?? 'ACTIVE') as string,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
          deletedAt: data.deletedAt ?? null,
        };
        sessions.push(session);
        return Promise.resolve(session);
      },
      findFirst: ({ where }: { where: { id?: string; userId?: string; token?: string } }) => {
        const session = sessions.find((s) => {
          if (where.id && s.id !== where.id) return false;
          if (where.userId && s.userId !== where.userId) return false;
          if (where.token && s.token !== where.token) return false;
          return true;
        });
        return Promise.resolve(session ?? null);
      },
      findMany: ({
        where,
        orderBy,
      }: {
        where: {
          userId?: string;
          status?: string;
          deletedAt?: null;
          expiresAt?: { gt?: Date };
        };
        orderBy?: { createdAt?: 'asc' | 'desc' };
      }) => {
        let results = sessions.filter((s) => {
          if (where.userId && s.userId !== where.userId) return false;
          if (where.status && s.status !== where.status) return false;
          if (where.deletedAt === null && s.deletedAt !== null) return false;
          if (where.expiresAt?.gt && !(s.expiresAt > where.expiresAt.gt)) return false;
          return true;
        });
        if (orderBy?.createdAt === 'desc') {
          results = [...results].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        return Promise.resolve(results);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<MockSession> }) => {
        const index = sessions.findIndex((s) => s.id === where.id);
        if (index === -1) throw new Error('Session not found');
        sessions[index] = { ...sessions[index], ...data, updatedAt: new Date() };
        return Promise.resolve(sessions[index]);
      },
      updateMany: ({ where, data }: { where: { token?: string; userId?: string }; data: Partial<MockSession> }) => {
        sessions.forEach((s) => {
          const matchToken = where.token && s.token === where.token;
          const matchUser = where.userId && s.userId === where.userId;
          if (matchToken || matchUser) {
            Object.assign(s, data, { updatedAt: new Date() });
          }
        });
        return Promise.resolve({ count: 1 });
      },
    },
    refreshToken: {
      create: ({ data }: { data: Partial<MockRefreshToken> }) => {
        const rt: MockRefreshToken = {
          id: data.id ?? `rt-${refreshTokens.length + 1}`,
          userId: data.userId!,
          tokenHash: data.tokenHash!,
          expiresAt: data.expiresAt!,
          revokedAt: data.revokedAt ?? null,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
        };
        refreshTokens.push(rt);
        return Promise.resolve(rt);
      },
      findUnique: ({ where }: { where: { tokenHash?: string } }) => {
        const rt = refreshTokens.find((r) => where.tokenHash && r.tokenHash === where.tokenHash);
        return Promise.resolve(rt ?? null);
      },
      update: ({ where, data }: { where: { id: string }; data: Partial<MockRefreshToken> }) => {
        const index = refreshTokens.findIndex((r) => r.id === where.id);
        if (index === -1) throw new Error('RefreshToken not found');
        refreshTokens[index] = { ...refreshTokens[index], ...data, updatedAt: new Date() };
        return Promise.resolve(refreshTokens[index]);
      },
      updateMany: ({
        where,
        data,
      }: {
        where: { tokenHash?: string; userId?: string };
        data: Partial<MockRefreshToken>;
      }) => {
        refreshTokens.forEach((r) => {
          const matchToken = where.tokenHash && r.tokenHash === where.tokenHash;
          const matchUser = where.userId && r.userId === where.userId;
          if (matchToken || matchUser) {
            Object.assign(r, data, { updatedAt: new Date() });
          }
        });
        return Promise.resolve({ count: 1 });
      },
    },
    auditLog: {
      create: ({ data }: { data: Partial<MockAuditLog> }) => {
        const log: MockAuditLog = {
          id: `audit-${auditLogs.length + 1}`,
          userId: data.userId!,
          action: data.action ?? 'UPDATE',
          entityType: data.entityType ?? 'User',
          entityId: data.entityId ?? '',
          previousValue: data.previousValue ?? null,
          newValue: data.newValue ?? null,
          metadata: data.metadata ?? null,
          ipAddress: data.ipAddress ?? null,
          userAgent: data.userAgent ?? null,
          createdAt: new Date(),
        };
        auditLogs.push(log);
        return Promise.resolve(log);
      },
      findMany: () => Promise.resolve(auditLogs),
    },
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
  } as unknown as PrismaService;
}

const SEED_USER_ID = 'user-1';
const SEED_USER_EMAIL = 'profile-e2e@example.com';

// Tokens are produced by the real JwtTokenService so they match the
// application's configured secret and signing algorithm.
function signAccessToken(app: INestApplication, sub: string, email: string): string {
  const jwt = app.get(JwtTokenService);
  return jwt.signAccessToken({ sub, email }).accessToken;
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let storage: ReturnType<typeof createInMemoryStorage>;
  let accessToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-e2e';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;

    const sessions: MockSession[] = [
      {
        id: 'sess-current',
        userId: SEED_USER_ID,
        token: '5a36070bf233d84c5466bb2aac99452af8c9ec3ac14d5252158675d39a7f1994',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'sess-other',
        userId: SEED_USER_ID,
        token: '1817ecc957879e9f90049c81af8ee8acb6db0d0cb2f010224d03ca8bde6a7a55',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        ipAddress: '127.0.0.2',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120.0',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    storage = createInMemoryStorage();
    const prisma = createMockPrismaService({
      user: { id: SEED_USER_ID, email: SEED_USER_EMAIL },
      sessions,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(STORAGE_SERVICE)
      .useValue(storage)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.listen(0);
    baseUrl = await app.getUrl();

    accessToken = signAccessToken(app, SEED_USER_ID, SEED_USER_EMAIL);
  });

  afterAll(async () => {
    await app.close();
  });

  async function authed(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    return fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
    });
  }

  it('GET /api/users/me returns 401 without a token', async () => {
    const response = await fetch(`${baseUrl}/api/users/me`);
    expect(response.status).toBe(401);
  });

  it('GET /api/users/me returns the profile with a token', async () => {
    const response = await authed('GET', '/api/users/me');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(SEED_USER_ID);
    expect(body.data.email).toBe(SEED_USER_EMAIL);
  });

  it('PATCH /api/users/me updates the profile', async () => {
    const response = await authed('PATCH', '/api/users/me', {
      displayName: 'Test User',
      username: 'testuser',
      bio: 'Hello world',
      timezone: 'UTC',
      language: 'en',
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.displayName).toBe('Test User');
    expect(body.data.username).toBe('testuser');
  });

  it('PATCH /api/users/me rejects a duplicate username', async () => {
    // First update sets username to "duplicate_me".
    await authed('PATCH', '/api/users/me', { username: 'duplicate_me' });
    // Register a second user with a different id and try to set the same username.
    const prisma = app.get(PrismaService) as unknown as {
      user: { create: (args: { data: object }) => Promise<unknown> };
    };
    await prisma.user.create({
      data: {
        id: 'user-2',
        email: 'second@example.com',
        passwordHash: 'hash',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
    // Build an access token for user-2.
    const token2 = signAccessToken(app, 'user-2', 'second@example.com');
    const response = await fetch(`${baseUrl}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({ username: 'duplicate_me' }),
    });
    // Implementation surfaces uniqueness violations as field validation errors (400).
    expect(response.status).toBe(400);
  });

  it('PATCH /api/users/me/preferences merges JSON preferences', async () => {
    const response = await authed('PATCH', '/api/users/me/preferences', {
      defaultLandingPage: 'library',
      autoplay: true,
      defaultSort: 'rating',
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.defaultLandingPage).toBe('library');
    expect(body.data.autoplay).toBe(true);
    expect(body.data.defaultSort).toBe('rating');
  });

  it('PATCH /api/users/me/privacy merges JSON privacy', async () => {
    const response = await authed('PATCH', '/api/users/me/privacy', {
      profileVisibility: 'private',
      journalVisibility: 'followers',
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.profileVisibility).toBe('private');
    expect(body.data.journalVisibility).toBe('followers');
  });

  it('POST /api/users/me/avatar rejects invalid mime type', async () => {
    const form = new FormData();
    const blob = new Blob([Buffer.from('not-an-image')], { type: 'application/pdf' });
    form.append('avatar', blob, 'document.pdf');
    const response = await fetch(`${baseUrl}/api/users/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    expect(response.status).toBe(400);
  });

  it('POST /api/users/me/avatar accepts a PNG image', async () => {
    const form = new FormData();
    // Minimal PNG header bytes (not a valid image but mime check is what we verify here).
    const blob = new Blob([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], { type: 'image/png' });
    form.append('avatar', blob, 'avatar.png');
    const response = await fetch(`${baseUrl}/api/users/me/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(typeof body.data).toBe('string');
    expect(body.data.startsWith('avatars/')).toBe(true);
    expect(storage.files.has(body.data)).toBe(true);
  });

  it('DELETE /api/users/me/avatar clears the stored avatar', async () => {
    const response = await authed('DELETE', '/api/users/me/avatar');
    expect(response.status).toBe(200);
  });

  it('GET /api/users/me/sessions lists sessions and marks current', async () => {
    const response = await fetch(`${baseUrl}/api/users/me/sessions`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: 'refresh_token=refresh-current-token',
      },
      credentials: 'include',
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(2);
    const current = body.data.find((s: { id: string; isCurrent: boolean }) => s.id === 'sess-current');
    const other = body.data.find((s: { id: string; isCurrent: boolean }) => s.id === 'sess-other');
    expect(current?.isCurrent).toBe(true);
    expect(other?.isCurrent).toBe(false);
  });

  it('DELETE /api/users/me/sessions/:id revokes the session', async () => {
    const response = await authed('DELETE', '/api/users/me/sessions/sess-other');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe('sess-other');
    expect(body.data.status).toBe('REVOKED');
  });

  it('DELETE /api/users/me/sessions/:id returns 404 for unknown id', async () => {
    const response = await authed('DELETE', '/api/users/me/sessions/does-not-exist');
    expect(response.status).toBe(404);
  });
});
