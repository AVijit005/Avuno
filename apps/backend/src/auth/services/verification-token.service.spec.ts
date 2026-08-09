import 'reflect-metadata';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { createHash } from 'crypto';
import { EmailVerificationToken } from '@prisma/client';
import { VerificationTokenService } from './verification-token.service';
import { TokenFactory } from './token.factory';
import { EmailVerificationTokenRepository } from '../repositories/email-verification-token.repository';

function createMockToken(overrides?: Partial<EmailVerificationToken>): EmailVerificationToken {
  const now = new Date();
  return {
    id: 'token-1',
    userId: 'user-1',
    email: 'alice@example.com',
    tokenHash: 'hash-1',
    expiresAt: new Date(now.getTime() + 60_000),
    verifiedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as EmailVerificationToken;
}

describe('VerificationTokenService', () => {
  let service: VerificationTokenService;
  let tokenFactory: TokenFactory;
  let repositoryMock: {
    create: ReturnType<typeof mock>;
    findByTokenHash: ReturnType<typeof mock>;
    markVerified: ReturnType<typeof mock>;
    invalidatePreviousForUser: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    tokenFactory = new TokenFactory();
    repositoryMock = {
      create: mock(() => Promise.resolve(createMockToken())),
      findByTokenHash: mock(() => Promise.resolve(null)),
      markVerified: mock(() => Promise.resolve(createMockToken({ verifiedAt: new Date() }))),
      invalidatePreviousForUser: mock(() => Promise.resolve({ count: 0 })),
    };
    service = new VerificationTokenService(tokenFactory, repositoryMock as unknown as EmailVerificationTokenRepository);
  });

  describe('generateToken', () => {
    it('produces a non-empty string', () => {
      const token = service.generateToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('delegates to TokenFactory.generateSecureToken(32)', () => {
      // Typed parameter so `spy.mock.calls[0][0]` is inspectable; mock(() => x)
      // infers a zero-argument signature and an empty call tuple.
      const spy = mock((_bytes?: number) => 'fixed-token');
      const factory = {
        generateSecureToken: spy,
      } as unknown as TokenFactory;
      const s = new VerificationTokenService(factory, repositoryMock as unknown as EmailVerificationTokenRepository);
      const token = s.generateToken();
      expect(token).toBe('fixed-token');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]?.[0]).toBe(32);
    });

    it('generates unique tokens on repeated calls', () => {
      const a = service.generateToken();
      const b = service.generateToken();
      expect(a).not.toBe(b);
    });
  });

  describe('hashToken', () => {
    it('returns a SHA-256 hex digest', () => {
      const token = 'raw-token';
      const hash = service.hashToken(token);
      const expected = createHash('sha256').update(token).digest('hex');
      expect(hash).toBe(expected);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('is deterministic for the same input', () => {
      const token = 'another-token';
      expect(service.hashToken(token)).toBe(service.hashToken(token));
    });

    it('produces different hashes for different tokens', () => {
      expect(service.hashToken('a')).not.toBe(service.hashToken('b'));
    });
  });

  describe('repository delegation', () => {
    it('create delegates to repository.create', async () => {
      const token = createMockToken();
      repositoryMock.create.mockResolvedValueOnce(token);
      const expiresAt = new Date('2030-01-01T00:00:00Z');
      const result = await service.create({
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-1',
        expiresAt,
      });
      expect(result).toEqual(token);
      expect(repositoryMock.create).toHaveBeenCalledWith({
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-1',
        expiresAt,
      });
    });

    it('findByTokenHash delegates to repository', async () => {
      const token = createMockToken({ tokenHash: 'hash-2' });
      repositoryMock.findByTokenHash.mockResolvedValueOnce(token);
      const result = await service.findByTokenHash('hash-2');
      expect(result).toEqual(token);
      expect(repositoryMock.findByTokenHash).toHaveBeenCalledWith('hash-2');
    });

    it('markVerified delegates to repository', async () => {
      const token = createMockToken({ id: 'token-7', verifiedAt: new Date() });
      repositoryMock.markVerified.mockResolvedValueOnce(token);
      const result = await service.markVerified('token-7');
      expect(result).toEqual(token);
      expect(repositoryMock.markVerified).toHaveBeenCalledWith('token-7');
    });

    it('invalidatePreviousForUser delegates to repository', async () => {
      repositoryMock.invalidatePreviousForUser.mockResolvedValueOnce({ count: 3 });
      const result = await service.invalidatePreviousForUser('user-1');
      expect(result).toEqual({ count: 3 });
      expect(repositoryMock.invalidatePreviousForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
