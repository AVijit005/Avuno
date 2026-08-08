import 'reflect-metadata';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { User } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '../../common';
import { EmailVerificationService } from './email-verification.service';
import { VerificationTokenService } from './verification-token.service';
import { type EmailTransport } from './email-transport.abstraction';
import { AuthAuditService } from './auth-audit.service';
import { UserStateService } from './user-state.service';
import { AuthRepository } from '../auth.repository';

function createMockUser(overrides?: Partial<User>): User {
  const now = new Date();
  return {
    id: 'user-1',
    email: 'alice@example.com',
    passwordHash: 'hash',
    name: 'Alice',
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
    status: 'PENDING_VERIFICATION',
    emailVerified: false,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  } as User;
}

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let verificationTokensMock: {
    generateToken: ReturnType<typeof mock>;
    hashToken: ReturnType<typeof mock>;
    invalidatePreviousForUser: ReturnType<typeof mock>;
    create: ReturnType<typeof mock>;
    findByTokenHash: ReturnType<typeof mock>;
    markVerified: ReturnType<typeof mock>;
  };
  let transportMock: { sendVerificationEmail: ReturnType<typeof mock> };
  let auditMock: {
    logAudit: ReturnType<typeof mock>;
    logSecurityEvent: ReturnType<typeof mock>;
  };
  let userRepoMock: {
    findById: ReturnType<typeof mock>;
    findByEmail: ReturnType<typeof mock>;
    save: ReturnType<typeof mock>;
  };
  let configMock: { get: ReturnType<typeof mock> };
  let userStateMock: { invalidate: () => Promise<void>; getState: () => Promise<null> };

  beforeEach(() => {
    verificationTokensMock = {
      generateToken: mock(() => 'raw-token-abc'),
      hashToken: mock((token: string) => `hash-of-${token}`),
      invalidatePreviousForUser: mock(() => Promise.resolve({ count: 0 })),
      create: mock(() => Promise.resolve({ id: 'token-row-1' })),
      findByTokenHash: mock(() => Promise.resolve(null)),
      markVerified: mock(() => Promise.resolve({ id: 'token-row-1' })),
    };
    transportMock = {
      sendVerificationEmail: mock(() => Promise.resolve(undefined)),
    };
    auditMock = {
      logAudit: mock(() => Promise.resolve(undefined)),
      logSecurityEvent: mock(() => Promise.resolve(undefined)),
    };
    userRepoMock = {
      findById: mock(() => Promise.resolve(null)),
      findByEmail: mock(() => Promise.resolve(null)),
      save: mock((entity: User) => Promise.resolve(entity)),
    };
    configMock = {
      get: mock((key: string) => {
        if (key === 'emailVerification.ttlSeconds') return 86400;
        if (key === 'emailVerification.baseUrl') return 'http://localhost:3000/api';
        return undefined;
      }),
    };

    userStateMock = { invalidate: async () => undefined, getState: async () => null };

    service = new EmailVerificationService(
      verificationTokensMock as unknown as VerificationTokenService,
      transportMock as unknown as EmailTransport,
      auditMock as unknown as AuthAuditService,
      userRepoMock as unknown as AuthRepository,
      configMock as never,
      userStateMock as unknown as UserStateService,
    );
  });

  describe('sendVerification', () => {
    it('generates a token, invalidates previous tokens, stores new token, sends email, logs security event', async () => {
      const result = await service.sendVerification('user-1', 'alice@example.com', 'Alice', {
        ipAddress: '127.0.0.1',
        userAgent: 'bun-test',
      });

      expect(result).toEqual({ email: 'alice@example.com' });
      expect(verificationTokensMock.generateToken).toHaveBeenCalledTimes(1);
      expect(verificationTokensMock.hashToken).toHaveBeenCalledWith('raw-token-abc');
      expect(verificationTokensMock.invalidatePreviousForUser).toHaveBeenCalledWith('user-1');
      expect(verificationTokensMock.create).toHaveBeenCalledTimes(1);
      const createCall = verificationTokensMock.create.mock.calls[0]?.[0] as {
        userId: string;
        email: string;
        tokenHash: string;
        expiresAt: Date;
      };
      expect(createCall.userId).toBe('user-1');
      expect(createCall.email).toBe('alice@example.com');
      expect(createCall.tokenHash).toBe('hash-of-raw-token-abc');
      expect(createCall.expiresAt).toBeInstanceOf(Date);
      expect(createCall.expiresAt.getTime()).toBeGreaterThan(Date.now());

      expect(transportMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [
        string,
        { token: string; link: string; userDisplayName?: string },
      ];
      expect(transportCall[0]).toBe('alice@example.com');
      expect(transportCall[1].token).toBe('raw-token-abc');
      expect(transportCall[1].link).toBe('http://localhost:3000/api/auth/email/verify?token=raw-token-abc');
      expect(transportCall[1].userDisplayName).toBe('Alice');

      expect(auditMock.logSecurityEvent).toHaveBeenCalledTimes(1);
      const eventCall = auditMock.logSecurityEvent.mock.calls[0] as unknown as [
        string,
        string,
        string,
        { ipAddress: string; userAgent: string },
      ];
      expect(eventCall[0]).toBe('user-1');
      expect(eventCall[1]).toBe('EMAIL_VERIFICATION_SENT');
      expect(eventCall[2]).toBe('LOW');
      expect(eventCall[3].ipAddress).toBe('127.0.0.1');
      expect(eventCall[3].userAgent).toBe('bun-test');
    });

    it('omits userDisplayName when not provided', async () => {
      await service.sendVerification('user-1', 'alice@example.com');
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [
        string,
        { token: string; link: string; userDisplayName?: string },
      ];
      expect(transportCall[1].userDisplayName).toBeUndefined();
    });

    it('uses baseUrl from config', async () => {
      configMock.get.mockImplementation((key: string) => {
        if (key === 'emailVerification.baseUrl') return 'https://example.com/v1';
        if (key === 'emailVerification.ttlSeconds') return 3600;
        return undefined;
      });
      await service.sendVerification('user-1', 'alice@example.com');
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [string, { link: string }];
      expect(transportCall[1].link).toBe('https://example.com/v1/auth/email/verify?token=raw-token-abc');
    });

    it('strips trailing slash from baseUrl', async () => {
      configMock.get.mockImplementation((key: string) => {
        if (key === 'emailVerification.baseUrl') return 'https://example.com/v1/';
        if (key === 'emailVerification.ttlSeconds') return 3600;
        return undefined;
      });
      await service.sendVerification('user-1', 'alice@example.com');
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [string, { link: string }];
      expect(transportCall[1].link).toBe('https://example.com/v1/auth/email/verify?token=raw-token-abc');
    });
  });

  describe('verifyEmail', () => {
    it('hashes token, marks verified, updates user, and logs EMAIL_VERIFIED audit', async () => {
      const future = new Date(Date.now() + 60_000);
      const tokenRow = {
        id: 'token-row-1',
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-of-raw-token-abc',
        expiresAt: future,
        verifiedAt: null,
      };
      const user = createMockUser({ status: 'PENDING_VERIFICATION', emailVerified: false });
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(tokenRow);
      userRepoMock.findById.mockResolvedValueOnce(user);
      userRepoMock.save.mockImplementation(async (entity: User) => entity);

      const result = await service.verifyEmail('raw-token-abc', {
        ipAddress: '127.0.0.1',
        userAgent: 'bun-test',
      });

      expect(result.id).toBe('user-1');
      expect(result.emailVerified).toBe(true);
      expect(result.status).toBe('ACTIVE');

      expect(verificationTokensMock.hashToken).toHaveBeenCalledWith('raw-token-abc');
      expect(verificationTokensMock.findByTokenHash).toHaveBeenCalledWith('hash-of-raw-token-abc');
      expect(verificationTokensMock.markVerified).toHaveBeenCalledWith('token-row-1');
      expect(userRepoMock.save).toHaveBeenCalledTimes(1);

      expect(auditMock.logAudit).toHaveBeenCalledTimes(1);
      const auditCall = auditMock.logAudit.mock.calls[0] as unknown as [
        string,
        string,
        string,
        string,
        { emailVerified: boolean; status: string },
        { emailVerified: boolean; status: string },
        { ipAddress: string; userAgent: string },
      ];
      expect(auditCall[0]).toBe('EMAIL_VERIFIED');
      expect(auditCall[1]).toBe('user-1');
      expect(auditCall[2]).toBe('User');
      expect(auditCall[3]).toBe('user-1');
      expect(auditCall[4]).toEqual({ emailVerified: false, status: 'PENDING_VERIFICATION' });
      expect(auditCall[5]).toEqual({ emailVerified: true, status: 'ACTIVE' });
      expect(auditCall[6].ipAddress).toBe('127.0.0.1');
      expect(auditCall[6].userAgent).toBe('bun-test');
    });

    it('does not change status when user is not PENDING_VERIFICATION', async () => {
      const future = new Date(Date.now() + 60_000);
      const tokenRow = {
        id: 'token-row-1',
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-of-raw-token-abc',
        expiresAt: future,
        verifiedAt: null,
      };
      const user = createMockUser({ status: 'ACTIVE', emailVerified: false });
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(tokenRow);
      userRepoMock.findById.mockResolvedValueOnce(user);
      userRepoMock.save.mockImplementation(async (entity: User) => entity);

      const result = await service.verifyEmail('raw-token-abc');
      expect(result.status).toBe('ACTIVE');
    });

    it('throws NotFoundException when token row is missing', async () => {
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(null);
      await expect(service.verifyEmail('missing')).rejects.toBeInstanceOf(NotFoundException);
      expect(verificationTokensMock.markVerified).not.toHaveBeenCalled();
      expect(userRepoMock.save).not.toHaveBeenCalled();
      expect(auditMock.logAudit).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when token row already verified (one-time use)', async () => {
      const tokenRow = {
        id: 'token-row-1',
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-of-raw-token-abc',
        expiresAt: new Date(Date.now() + 60_000),
        verifiedAt: new Date(),
      };
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(tokenRow);
      await expect(service.verifyEmail('raw-token-abc')).rejects.toBeInstanceOf(NotFoundException);
      expect(verificationTokensMock.markVerified).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when token is expired', async () => {
      const tokenRow = {
        id: 'token-row-1',
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-of-raw-token-abc',
        expiresAt: new Date(Date.now() - 1000),
        verifiedAt: null,
      };
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(tokenRow);
      await expect(service.verifyEmail('raw-token-abc')).rejects.toBeInstanceOf(ForbiddenException);
      expect(verificationTokensMock.markVerified).not.toHaveBeenCalled();
      expect(userRepoMock.save).not.toHaveBeenCalled();
      expect(auditMock.logAudit).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user no longer exists', async () => {
      const future = new Date(Date.now() + 60_000);
      const tokenRow = {
        id: 'token-row-1',
        userId: 'user-1',
        email: 'alice@example.com',
        tokenHash: 'hash-of-raw-token-abc',
        expiresAt: future,
        verifiedAt: null,
      };
      verificationTokensMock.findByTokenHash.mockResolvedValueOnce(tokenRow);
      userRepoMock.findById.mockResolvedValueOnce(null);
      await expect(service.verifyEmail('raw-token-abc')).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('resendVerification', () => {
    it('throws NotFoundException when user does not exist', async () => {
      userRepoMock.findByEmail.mockResolvedValueOnce(null);
      await expect(service.resendVerification('missing@example.com')).rejects.toBeInstanceOf(NotFoundException);
      expect(verificationTokensMock.generateToken).not.toHaveBeenCalled();
      expect(transportMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when user is already verified', async () => {
      const user = createMockUser({ emailVerified: true });
      userRepoMock.findByEmail.mockResolvedValueOnce(user);
      await expect(service.resendVerification('alice@example.com')).rejects.toBeInstanceOf(NotFoundException);
      expect(verificationTokensMock.generateToken).not.toHaveBeenCalled();
    });

    it('calls sendVerification for an unverified user', async () => {
      const user = createMockUser({
        email: 'alice@example.com',
        displayName: 'Alice Display',
        emailVerified: false,
      });
      userRepoMock.findByEmail.mockResolvedValueOnce(user);

      const result = await service.resendVerification('alice@example.com', {
        ipAddress: '127.0.0.1',
      });

      expect(result).toEqual({ email: 'alice@example.com' });
      expect(verificationTokensMock.invalidatePreviousForUser).toHaveBeenCalledWith('user-1');
      expect(verificationTokensMock.generateToken).toHaveBeenCalledTimes(1);
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [
        string,
        { userDisplayName?: string },
      ];
      expect(transportCall[0]).toBe('alice@example.com');
      expect(transportCall[1].userDisplayName).toBe('Alice Display');
      expect(auditMock.logSecurityEvent).toHaveBeenCalledTimes(1);
    });

    it('falls back to user.name and then to metadata.userDisplayName', async () => {
      const user = createMockUser({
        displayName: null,
        name: 'Alice Name',
        emailVerified: false,
      });
      userRepoMock.findByEmail.mockResolvedValueOnce(user);
      await service.resendVerification('alice@example.com', { userDisplayName: 'Meta Alice' });
      const transportCall = transportMock.sendVerificationEmail.mock.calls[0] as unknown as [
        string,
        { userDisplayName?: string },
      ];
      expect(transportCall[1].userDisplayName).toBe('Alice Name');
    });
  });
});
