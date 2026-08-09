import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
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

function createMockPrismaService() {
  const users: MockUser[] = [];
  const sessions: MockSession[] = [];
  const refreshTokens: MockRefreshToken[] = [];
  const emailVerificationTokens: unknown[] = [];

  const mockPrisma = {
    emailVerificationToken: {
      create: ({ data }: { data: Record<string, unknown> }) => {
        const token = { id: `evt-${emailVerificationTokens.length + 1}`, ...data };
        emailVerificationTokens.push(token);
        return Promise.resolve(token);
      },
      findUnique: ({ where }: { where: { tokenHash?: string } }) => {
        const token = emailVerificationTokens.find(
          (t: Record<string, unknown>) => where.tokenHash && t.tokenHash === where.tokenHash,
        );
        return Promise.resolve(token ?? null);
      },
      update: ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        return Promise.resolve({ id: where.id, ...data });
      },
      updateMany: () => Promise.resolve({ count: 0 }),
      count: () => Promise.resolve(0),
    },
    auditLog: {
      create: () => Promise.resolve({ id: 'audit-1' }),
    },
    securityEvent: {
      create: () => Promise.resolve({ id: 'event-1' }),
    },
    user: {
      findUnique: ({ where }: { where: { id?: string; email?: string } }) => {
        const user = users.find((u) => (where.id && u.id === where.id) || (where.email && u.email === where.email));
        return Promise.resolve(user && !user.deletedAt ? user : null);
      },
      count: ({ where }: { where: { email?: string } }) => {
        return Promise.resolve(users.filter((u) => !u.deletedAt && (!where.email || u.email === where.email)).length);
      },
      create: ({ data }: { data: Partial<MockUser> }) => {
        if (users.find((u) => u.email === data.email && !u.deletedAt)) {
          const err = new Error('Unique constraint failed');
          (err as any).code = 'P2002';
          return Promise.reject(err);
        }
        const user: MockUser = {
          id: data.id ?? `user-${users.length + 1}`,
          email: data.email!,
          passwordHash: data.passwordHash!,
          name: (data.name ?? null) as string | null,
          role: (data.role ?? 'USER') as string,
          status: 'ACTIVE' as string,
          emailVerified: true,
          lastLoginAt: data.lastLoginAt ?? null,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
          deletedAt: data.deletedAt ?? null,
        };
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
      findUnique: ({ where }: { where: { token?: string } }) => {
        const session = sessions.find((s) => where.token && s.token === where.token);
        return Promise.resolve(session ?? null);
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
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma),
  } as unknown as PrismaService;

  return mockPrisma;
}

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMockPrismaService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  async function post(path: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      credentials: 'include',
    });
  }

  function extractCookieValue(setCookie: string | null, name: string): string | undefined {
    if (!setCookie) return undefined;
    const match = setCookie.split(';').find((part) => part.trim().startsWith(`${name}=`));
    return match?.trim();
  }

  async function get(path: string, token?: string): Promise<Response> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${baseUrl}${path}`, {
      headers,
      credentials: 'include',
    });
  }

  it('POST /api/auth/register creates a user', async () => {
    const response = await post('/api/auth/register', {
      email: 'e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.email).toBe('e2e@example.com');
  });

  it('POST /api/auth/register rejects duplicate email', async () => {
    await post('/api/auth/register', {
      email: 'dup-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const response = await post('/api/auth/register', {
      email: 'dup-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(response.status).toBe(409);
  });

  it('POST /api/auth/login returns tokens and sets refresh cookie', async () => {
    await post('/api/auth/register', {
      email: 'login-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const response = await post('/api/auth/login', {
      email: 'login-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('refresh_token');
    const body = await response.json();
    expect(body.data.accessToken).toBeDefined();
  });

  it('GET /api/auth/me requires access token', async () => {
    const response = await get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('GET /api/auth/me returns current user', async () => {
    await post('/api/auth/register', {
      email: 'me-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const login = await post('/api/auth/login', {
      email: 'me-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const loginBody = await login.json();
    const response = await get('/api/auth/me', loginBody.data.accessToken);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe('me-e2e@example.com');
  });

  it('POST /api/auth/refresh rotates tokens', async () => {
    await post('/api/auth/register', {
      email: 'refresh-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const login = await post('/api/auth/login', {
      email: 'refresh-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const cookies = login.headers.get('set-cookie');
    expect(cookies).toContain('refresh_token');
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: extractCookieValue(cookies, 'refresh_token') ?? '', 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.accessToken).toBeDefined();
    expect(response.headers.get('set-cookie')).toContain('refresh_token');
  });

  it('POST /api/auth/logout clears refresh cookie', async () => {
    await post('/api/auth/register', {
      email: 'logout-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const login = await post('/api/auth/login', {
      email: 'logout-e2e@example.com',
      password: 'StrongP@ssw0rd123',
    });
    const cookies = login.headers.get('set-cookie');
    const loginBody = await login.json();
    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: extractCookieValue(cookies, 'refresh_token') ?? '',
        Authorization: `Bearer ${loginBody.data.accessToken}`,
      },
      credentials: 'include',
    });
    expect(response.status).toBe(200);
    const clearCookie = response.headers.get('set-cookie');
    expect(clearCookie).toContain('refresh_token');
    expect(clearCookie).toContain('Expires=Thu, 01 Jan 1970');
  });
});
