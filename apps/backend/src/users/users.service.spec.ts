import 'reflect-metadata';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Prisma, Session, User } from '@prisma/client';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { EventPublisher, InMemoryEventPublisher } from '../core';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { ProfileService } from './services/profile.service';
import { PreferencesService } from './services/preferences.service';
import { PrivacyService } from './services/privacy.service';
import { AvatarService } from './services/avatar.service';
import { UserAuditLogService } from './services/user-audit-log.service';
import { UserAgentParser } from './services/user-agent-parser';
import { hashSessionToken } from '../auth/services/session-token';
import {
  UserPreferencesUpdatedEvent,
  UserPrivacyUpdatedEvent,
  UserProfileUpdatedEvent,
  UserAvatarUpdatedEvent,
} from './users.types';

function createUser(overrides?: Partial<User>): User {
  const now = new Date();
  return {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: null,
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
    preferences: Prisma.JsonNull,
    privacy: Prisma.JsonNull,
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

function createSession(overrides?: Partial<Session>): Session {
  const now = new Date();
  const future = new Date(now.getTime() + 60_000);
  return {
    id: 'session-1',
    userId: 'user-1',
    token: 'refresh-token-1',
    expiresAt: future,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  } as Session;
}

describe('UsersService', () => {
  let users: UsersRepository;
  let profileService: ProfileService;
  let preferencesService: PreferencesService;
  let privacyService: PrivacyService;
  let avatarService: AvatarService;
  let audit: UserAuditLogService;
  let events: InMemoryEventPublisher;
  let requestContext: { getCorrelationId: ReturnType<typeof mock>; get: ReturnType<typeof mock> };
  let service: UsersService;

  beforeEach(() => {
    users = {
      findByIdWithProfile: mock(() => Promise.resolve(createUser())),
      findByUsernameExcludingUserId: mock(() => Promise.resolve(null)),
      updateProfile: mock((id: string, data: Partial<User>) =>
        Promise.resolve(createUser({ id, ...data } as Partial<User>)),
      ),
      updatePreferences: mock(() => Promise.resolve(createUser())),
      updatePrivacy: mock(() => Promise.resolve(createUser())),
      updateAvatar: mock((id: string, path: string) => Promise.resolve(createUser({ id, avatar: path }))),
      removeAvatar: mock((id: string) => Promise.resolve(createUser({ id, avatar: null }))),
      findSessionsByUserId: mock(() => Promise.resolve([])),
      findSessionByIdAndUserId: mock(() => Promise.resolve(null)),
      revokeSession: mock(() => Promise.resolve(undefined)),
    } as unknown as UsersRepository;

    const success = <T>(value: T) => ({
      isSuccess: () => true,
      isFailure: () => false,
      getValue: () => value,
      getError: () => undefined,
    });
    const failure = <E>(error: E) => ({
      isSuccess: () => false,
      isFailure: () => true,
      getValue: () => undefined,
      getError: () => error,
    });

    profileService = {
      getProfile: mock(() => Promise.resolve(success(createUser()))),
      updateProfile: mock((id: string, dto: { displayName?: string }) =>
        Promise.resolve(success(createUser({ id, displayName: dto.displayName }))),
      ),
    } as unknown as ProfileService;

    preferencesService = {
      getPreferences: mock(() => Promise.resolve(success({}))),
      updatePreferences: mock(() => Promise.resolve(success({ autoplay: true }))),
    } as unknown as PreferencesService;

    privacyService = {
      getPrivacy: mock(() => Promise.resolve(success({}))),
      updatePrivacy: mock(() => Promise.resolve(success({ profileVisibility: 'public' }))),
    } as unknown as PrivacyService;

    avatarService = {
      uploadAvatar: mock(() => Promise.resolve(success('avatars/user-1/abc.png'))),
      deleteAvatar: mock(() => Promise.resolve(success(null))),
    } as unknown as AvatarService;

    // Keep references for tests that need to override the default Result
    (profileService as unknown as Record<string, unknown>).__success = success;
    (profileService as unknown as Record<string, unknown>).__failure = failure;

    audit = {
      logChange: mock(() => Promise.resolve()),
    } as unknown as UserAuditLogService;

    events = new InMemoryEventPublisher();
    requestContext = {
      getCorrelationId: mock(() => 'corr-1'),
      get: mock(() => ({ requestId: 'req-1', correlationId: 'corr-1', userId: 'user-1' })),
    };

    service = new UsersService(
      users,
      profileService,
      preferencesService,
      privacyService,
      avatarService,
      audit,
      events as unknown as EventPublisher,
      requestContext as never,
      new UserAgentParser(),
    );
  });

  describe('getMe', () => {
    it('returns the profile via ProfileService', async () => {
      const result = await service.getMe('user-1');
      expect(result.id).toBe('user-1');
    });

    it('throws when the profile service fails', async () => {
      const failure = (profileService as unknown as { __failure: <E>(e: E) => unknown }).__failure;
      (profileService.getProfile as ReturnType<typeof mock>).mockResolvedValueOnce(
        failure(new NotFoundException('User not found')),
      );
      await expect(service.getMe('user-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('delegates, audits, and publishes UserProfileUpdatedEvent', async () => {
      const result = await service.updateProfile(
        'user-1',
        { displayName: 'Alice' },
        {
          ipAddress: '10.0.0.1',
          userAgent: 'curl/8.0',
        },
      );

      expect(result.displayName).toBe('Alice');
      expect(audit.logChange).toHaveBeenCalledTimes(1);
      const [userId, entityType, entityId, prev, next, meta] = (audit.logChange as ReturnType<typeof mock>).mock
        .calls[0];
      expect(userId).toBe('user-1');
      expect(entityType).toBe('User');
      expect(entityId).toBe('user-1');
      expect(prev).not.toBeNull();
      expect(next).toMatchObject({ displayName: 'Alice' });
      expect(meta.correlationId).toBe('corr-1');
      expect(meta.ipAddress).toBe('10.0.0.1');
      expect(meta.userAgent).toBe('curl/8.0');

      const published = events.publishedEvents();
      expect(published.length).toBe(1);
      expect(published[0]).toBeInstanceOf(UserProfileUpdatedEvent);
    });

    it('throws and does not audit or publish on failure', async () => {
      const failure = (profileService as unknown as { __failure: <E>(e: E) => unknown }).__failure;
      (profileService.updateProfile as ReturnType<typeof mock>).mockResolvedValueOnce(
        failure(new ValidationException('bad')),
      );
      await expect(service.updateProfile('user-1', { displayName: 'X' })).rejects.toBeInstanceOf(ValidationException);
      expect(audit.logChange).not.toHaveBeenCalled();
      expect(events.publishedEvents().length).toBe(0);
    });
  });

  describe('updatePreferences', () => {
    it('delegates, audits, and publishes UserPreferencesUpdatedEvent', async () => {
      const result = await service.updatePreferences('user-1', { autoplay: true });
      expect(result.autoplay).toBe(true);
      expect(audit.logChange).toHaveBeenCalledTimes(1);
      const [, entityType] = (audit.logChange as ReturnType<typeof mock>).mock.calls[0];
      expect(entityType).toBe('UserPreferences');
      expect(events.publishedEvents()[0]).toBeInstanceOf(UserPreferencesUpdatedEvent);
    });
  });

  describe('updatePrivacy', () => {
    it('delegates, audits, and publishes UserPrivacyUpdatedEvent', async () => {
      const result = await service.updatePrivacy('user-1', { profileVisibility: 'public' });
      expect(result.profileVisibility).toBe('public');
      const [, entityType] = (audit.logChange as ReturnType<typeof mock>).mock.calls[0];
      expect(entityType).toBe('UserPrivacy');
      expect(events.publishedEvents()[0]).toBeInstanceOf(UserPrivacyUpdatedEvent);
    });
  });

  describe('updateAvatar', () => {
    it('delegates, audits, and publishes UserAvatarUpdatedEvent', async () => {
      const result = await service.updateAvatar(
        'user-1',
        { buffer: Buffer.from('x'), mimeType: 'image/png', originalName: 'a.png', size: 1 },
        { ipAddress: '127.0.0.1', userAgent: 'curl' },
      );
      expect(result).toBe('avatars/user-1/abc.png');
      expect(audit.logChange).toHaveBeenCalledTimes(1);
      expect(events.publishedEvents()[0]).toBeInstanceOf(UserAvatarUpdatedEvent);
    });
  });

  describe('deleteAvatar', () => {
    it('delegates, audits, and publishes UserAvatarUpdatedEvent with null path', async () => {
      await service.deleteAvatar('user-1');
      expect(audit.logChange).toHaveBeenCalledTimes(1);
      const event = events.publishedEvents()[0] as UserAvatarUpdatedEvent;
      expect(event).toBeInstanceOf(UserAvatarUpdatedEvent);
      expect(event.avatarPath).toBeNull();
    });
  });

  describe('listSessions', () => {
    it('returns an empty list when no sessions exist', async () => {
      const result = await service.listSessions('user-1');
      expect(result).toEqual([]);
    });

    it('maps lastSeen to updatedAt and parses userAgent', async () => {
      const sessions = [createSession({ id: 's-1', updatedAt: new Date('2025-01-01') })];
      (users.findSessionsByUserId as ReturnType<typeof mock>).mockResolvedValueOnce(sessions);
      const result = await service.listSessions('user-1');
      expect(result.length).toBe(1);
      expect(result[0].browser).toBe('Chrome');
      expect(result[0].os).toBe('macOS');
      expect(result[0].lastSeen).toEqual(new Date('2025-01-01'));
      expect(result[0].isCurrent).toBe(false);
    });

    it('marks the session whose token matches the refresh token as isCurrent', async () => {
      // sessions.token now holds sha256(token), not the raw value, so the
      // fixtures must be hashed for the comparison to be meaningful.
      const s1 = createSession({ id: 's-1', token: hashSessionToken('refresh-A') });
      const s2 = createSession({ id: 's-2', token: hashSessionToken('refresh-B') });
      (users.findSessionsByUserId as ReturnType<typeof mock>).mockResolvedValueOnce([s1, s2]);

      const result = await service.listSessions('user-1', 'refresh-B');
      const s1Resp = result.find((r) => r.id === 's-1');
      const s2Resp = result.find((r) => r.id === 's-2');
      expect(s1Resp?.isCurrent).toBe(false);
      expect(s2Resp?.isCurrent).toBe(true);
    });

    it('no session is current when refreshToken is undefined', async () => {
      const s = createSession({ token: hashSessionToken('refresh-X') });
      (users.findSessionsByUserId as ReturnType<typeof mock>).mockResolvedValueOnce([s]);
      const result = await service.listSessions('user-1');
      expect(result[0].isCurrent).toBe(false);
    });
  });

  describe('revokeSession', () => {
    it('throws NotFoundException when session is missing or owned by another user', async () => {
      (users.findSessionByIdAndUserId as ReturnType<typeof mock>).mockResolvedValueOnce(null);
      await expect(service.revokeSession('user-1', 'session-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(users.revokeSession).not.toHaveBeenCalled();
    });

    it('revokes the session and returns a mapped response', async () => {
      const session = createSession();
      (users.findSessionByIdAndUserId as ReturnType<typeof mock>).mockResolvedValueOnce(session);
      const result = await service.revokeSession('user-1', 'session-1');
      expect(result.id).toBe('session-1');
      expect(result.status).toBe('REVOKED');
      expect(users.revokeSession).toHaveBeenCalledWith('session-1', 'user-1');
    });
  });
});
