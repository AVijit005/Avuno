import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { OAuthAccount, OAuthProvider } from '@prisma/client';
import { OAuthAccountRepository } from './oauth-account.repository';

function createMockOAuthAccount(overrides?: Partial<OAuthAccount>): OAuthAccount {
  const now = new Date();
  return {
    id: 'oauth-1',
    userId: 'user-1',
    provider: 'GOOGLE' as OAuthProvider,
    providerAccountId: 'google-1',
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    scope: null,
    idToken: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  } as OAuthAccount;
}

describe('OAuthAccountRepository', () => {
  let repository: OAuthAccountRepository;
  let prismaMock: {
    oAuthAccount: {
      findUnique: ReturnType<typeof mock>;
      count: ReturnType<typeof mock>;
      create: ReturnType<typeof mock>;
      update: ReturnType<typeof mock>;
      delete: ReturnType<typeof mock>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      oAuthAccount: {
        findUnique: mock(() => Promise.resolve(null)),
        count: mock(() => Promise.resolve(0)),
        create: mock(() => Promise.resolve(createMockOAuthAccount())),
        update: mock(() => Promise.resolve(createMockOAuthAccount())),
        delete: mock(() => Promise.resolve(undefined)),
      },
    };
    // A valid 32-byte key in hex. The repository now rejects short or missing
    // keys instead of silently padding them, so the mock must supply a real one.
    const configMock = {
      get: (key: string) =>
        key === 'oauth.encryptionKey' ? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' : undefined,
    };
    repository = new OAuthAccountRepository(prismaMock as never, configMock as never);
  });

  it('findById delegates to prisma.oAuthAccount.findUnique', async () => {
    const account = createMockOAuthAccount({ id: 'oauth-2' });
    prismaMock.oAuthAccount.findUnique.mockResolvedValueOnce(account);
    const result = await repository.findById('oauth-2');
    expect(result).toEqual(account);
    expect(prismaMock.oAuthAccount.findUnique).toHaveBeenCalledWith({ where: { id: 'oauth-2' } });
  });

  it('exists returns true when count is greater than zero', async () => {
    prismaMock.oAuthAccount.count.mockResolvedValueOnce(1);
    const result = await repository.exists('oauth-1');
    expect(result).toBe(true);
    expect(prismaMock.oAuthAccount.count).toHaveBeenCalledWith({ where: { id: 'oauth-1' } });
  });

  it('exists returns false when count is zero', async () => {
    prismaMock.oAuthAccount.count.mockResolvedValueOnce(0);
    const result = await repository.exists('oauth-1');
    expect(result).toBe(false);
  });

  it('save updates an oauth account by id', async () => {
    const account = createMockOAuthAccount({ id: 'oauth-3', scope: 'email profile' });
    prismaMock.oAuthAccount.update.mockResolvedValueOnce(account);
    const result = await repository.save(account);
    expect(result).toEqual(account);
    expect(prismaMock.oAuthAccount.update).toHaveBeenCalled();
  });

  it('delete performs a soft delete by setting deletedAt', async () => {
    prismaMock.oAuthAccount.update.mockResolvedValueOnce(undefined);
    await repository.delete('oauth-1');
    expect(prismaMock.oAuthAccount.update).toHaveBeenCalledTimes(1);
    const call = prismaMock.oAuthAccount.update.mock.calls[0]?.[0] as {
      where: { id: string };
      data: { deletedAt: Date };
    };
    expect(call.where.id).toBe('oauth-1');
    expect(call.data.deletedAt).toBeInstanceOf(Date);
  });

  it('findByProviderAndAccountId uses the compound unique', async () => {
    const account = createMockOAuthAccount({ provider: 'GOOGLE', providerAccountId: 'google-7' });
    prismaMock.oAuthAccount.findUnique.mockResolvedValueOnce(account);
    const result = await repository.findByProviderAndAccountId('GOOGLE', 'google-7');
    expect(result).toEqual(account);
    expect(prismaMock.oAuthAccount.findUnique).toHaveBeenCalledWith({
      where: {
        provider_providerAccountId: {
          provider: 'GOOGLE',
          providerAccountId: 'google-7',
        },
      },
    });
  });

  it('create persists an oauth account', async () => {
    const account = createMockOAuthAccount();
    prismaMock.oAuthAccount.create.mockResolvedValueOnce(account);
    const result = await repository.create({
      userId: 'user-1',
      provider: 'GOOGLE',
      providerAccountId: 'google-1',
    });
    expect(result).toEqual(account);
    expect(prismaMock.oAuthAccount.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        provider: 'GOOGLE',
        providerAccountId: 'google-1',
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        scope: null,
        idToken: null,
        expiresAt: null,
      },
    });
  });

  it('create propagates token fields when provided', async () => {
    const account = createMockOAuthAccount({
      accessToken: 'access',
      refreshToken: 'refresh',
      idToken: 'id-token',
    });
    prismaMock.oAuthAccount.create.mockResolvedValueOnce(account);
    const expiresAt = new Date('2030-01-01T00:00:00Z');
    await repository.create({
      userId: 'user-1',
      provider: 'GOOGLE',
      providerAccountId: 'google-1',
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      scope: 'email profile',
      idToken: 'id-token',
      expiresAt,
    });
    const written = prismaMock.oAuthAccount.create.mock.calls[0][0].data;

    expect(written).toMatchObject({
      userId: 'user-1',
      provider: 'GOOGLE',
      providerAccountId: 'google-1',
      tokenType: 'Bearer',
      scope: 'email profile',
      idToken: 'id-token',
      expiresAt,
    });

    // Provider tokens are encrypted at rest (AES-256-GCM, iv:ciphertext:tag),
    // so the plaintext must never reach the database.
    expect(written.accessToken).not.toBe('access');
    expect(written.refreshToken).not.toBe('refresh');
    expect(written.accessToken).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
    expect(written.refreshToken).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
  });
});
