import { Inject, Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';
import { NotFoundException } from '../common/exceptions';
import { EVENT_PUBLISHER, RequestContextService } from '../core';
import type { EventPublisher } from '../core/events/event-publisher.abstraction';
import { UpdatePreferencesDto, UpdatePrivacyDto, UpdateProfileDto } from './dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { AvatarService, AvatarFile } from './services/avatar.service';
import { PreferencesService } from './services/preferences.service';
import { PrivacyService } from './services/privacy.service';
import { ProfileService } from './services/profile.service';
import { UserAuditLogService, AuditLogMetadata } from './services/user-audit-log.service';
import { UserAgentParser } from './services/user-agent-parser';
import {
  UserAvatarUpdatedEvent,
  UserPreferencesUpdatedEvent,
  UserPrivacyUpdatedEvent,
  UserProfileUpdatedEvent,
} from './users.types';
import { UsersRepository } from './users.repository';
import { sessionTokenMatches } from '../auth/services/session-token';

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly profileService: ProfileService,
    private readonly preferencesService: PreferencesService,
    private readonly privacyService: PrivacyService,
    private readonly avatarService: AvatarService,
    private readonly audit: UserAuditLogService,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    private readonly requestContext: RequestContextService,
    private readonly agentParser: UserAgentParser,
  ) {}

  async getMe(userId: string) {
    const result = await this.profileService.getProfile(userId);
    if (result.isFailure()) {
      throw result.getError();
    }
    return result.getValue();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, metadata?: RequestMetadata) {
    const before = await this.profileService.getProfile(userId);
    const previousValue = before.isSuccess() ? before.getValue() : null;

    const result = await this.profileService.updateProfile(userId, dto);
    if (result.isFailure()) {
      throw result.getError();
    }
    const updated = result.getValue();

    await this.writeAudit(userId, 'User', userId, previousValue, updated, metadata, {
      changedFields: Object.keys(dto),
    });
    await this.events.publish(
      new UserProfileUpdatedEvent(
        userId,
        userId,
        this.diff(
          previousValue as unknown as Record<string, unknown> | null,
          updated as unknown as Record<string, unknown>,
        ),
        this.eventMetadata(metadata),
      ),
    );
    return updated;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto, metadata?: RequestMetadata) {
    const before = await this.preferencesService.getPreferences(userId);
    const previousValue = before.isSuccess() ? before.getValue() : null;

    const result = await this.preferencesService.updatePreferences(userId, dto);
    if (result.isFailure()) {
      throw result.getError();
    }
    const updated = result.getValue();

    await this.writeAudit(userId, 'UserPreferences', userId, previousValue, updated, metadata);
    await this.events.publish(new UserPreferencesUpdatedEvent(userId, userId, updated, this.eventMetadata(metadata)));
    return updated;
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto, metadata?: RequestMetadata) {
    const before = await this.privacyService.getPrivacy(userId);
    const previousValue = before.isSuccess() ? before.getValue() : null;

    const result = await this.privacyService.updatePrivacy(userId, dto);
    if (result.isFailure()) {
      throw result.getError();
    }
    const updated = result.getValue();

    await this.writeAudit(userId, 'UserPrivacy', userId, previousValue, updated, metadata);
    await this.events.publish(new UserPrivacyUpdatedEvent(userId, userId, updated, this.eventMetadata(metadata)));
    return updated;
  }

  async updateAvatar(userId: string, file: AvatarFile, metadata?: RequestMetadata) {
    const before = await this.profileService.getProfile(userId);
    const previousAvatar = before.isSuccess() ? before.getValue().avatar : null;

    const result = await this.avatarService.uploadAvatar(userId, file);
    if (result.isFailure()) {
      throw result.getError();
    }
    const avatarPath = result.getValue();

    await this.writeAudit(userId, 'UserAvatar', userId, { avatar: previousAvatar }, { avatar: avatarPath }, metadata);
    await this.events.publish(new UserAvatarUpdatedEvent(userId, userId, avatarPath, this.eventMetadata(metadata)));
    return avatarPath;
  }

  async deleteAvatar(userId: string, metadata?: RequestMetadata) {
    const before = await this.profileService.getProfile(userId);
    const previousAvatar = before.isSuccess() ? before.getValue().avatar : null;

    const result = await this.avatarService.deleteAvatar(userId);
    if (result.isFailure()) {
      throw result.getError();
    }

    await this.writeAudit(userId, 'UserAvatar', userId, { avatar: previousAvatar }, { avatar: null }, metadata);
    await this.events.publish(new UserAvatarUpdatedEvent(userId, userId, null, this.eventMetadata(metadata)));
  }

  async listSessions(userId: string, refreshToken?: string): Promise<SessionResponseDto[]> {
    const sessions = await this.users.findSessionsByUserId(userId, new Date());
    return sessions.map((session) => this.toSessionResponse(session, refreshToken));
  }

  async revokeSession(userId: string, sessionId: string): Promise<SessionResponseDto> {
    const session = await this.users.findSessionByIdAndUserId(sessionId, userId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.users.revokeSession(sessionId, userId);
    return this.toSessionResponse({ ...session, status: 'REVOKED', deletedAt: new Date() }, undefined);
  }

  private toSessionResponse(session: Session, refreshToken?: string): SessionResponseDto {
    const parsed = this.agentParser.parse(session.userAgent ?? null);
    return {
      id: session.id,
      browser: parsed.browser ?? null,
      os: parsed.os ?? null,
      ipAddress: session.ipAddress ?? null,
      lastSeen: session.updatedAt,
      // session.token holds a SHA-256 hash, so the raw cookie value must be
      // hashed before comparison — and compared in constant time.
      isCurrent: sessionTokenMatches(refreshToken, session.token),
      status: session.status,
      createdAt: session.createdAt,
    };
  }

  private async writeAudit(
    userId: string,
    entityType: string,
    entityId: string,
    previousValue: unknown,
    newValue: unknown,
    metadata: RequestMetadata | undefined,
    extra: Record<string, unknown> = {},
  ): Promise<void> {
    const auditMeta: AuditLogMetadata = {
      ...extra,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: this.requestContext.getCorrelationId(),
    };
    await this.audit.logChange(userId, entityType, entityId, previousValue, newValue, auditMeta);
  }

  private eventMetadata(metadata?: RequestMetadata): Record<string, unknown> {
    const eventMeta: Record<string, unknown> = {};
    const correlationId = this.requestContext.getCorrelationId();
    if (correlationId !== undefined) {
      eventMeta.correlationId = correlationId;
    }
    if (metadata?.ipAddress !== undefined) {
      eventMeta.ipAddress = metadata.ipAddress;
    }
    if (metadata?.userAgent !== undefined) {
      eventMeta.userAgent = metadata.userAgent;
    }
    return eventMeta;
  }

  private diff(previous: Record<string, unknown> | null, next: Record<string, unknown>): Record<string, unknown> {
    const changes: Record<string, unknown> = {};
    for (const key of Object.keys(next)) {
      if (!previous || previous[key] !== next[key]) {
        changes[key] = { from: previous ? (previous[key] ?? null) : null, to: next[key] ?? null };
      }
    }
    return changes;
  }
}
