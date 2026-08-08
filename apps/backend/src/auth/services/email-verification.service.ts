import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '../../common';
import { UserStateService } from './user-state.service';
import { AuthRepository } from '../auth.repository';
import { UserResponseDto } from '../dto';
import { AuthAuditService, type AuthAuditMetadata } from './auth-audit.service';
import { EMAIL_TRANSPORT, type EmailTransport, type VerificationEmailOptions } from './email-transport.abstraction';
import { VerificationTokenService } from './verification-token.service';

export interface SendVerificationMetadata extends AuthAuditMetadata {
  userDisplayName?: string;
}

export interface SendVerificationResult {
  email: string;
}

export type VerifyEmailMetadata = AuthAuditMetadata;

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly verificationTokens: VerificationTokenService,
    @Inject(EMAIL_TRANSPORT) private readonly emailTransport: EmailTransport,
    private readonly auditService: AuthAuditService,
    private readonly userRepository: AuthRepository,
    private readonly config: ConfigService,
    private readonly userState: UserStateService,
  ) {}

  async sendVerification(
    userId: string,
    email: string,
    displayName?: string,
    metadata: SendVerificationMetadata = {},
  ): Promise<SendVerificationResult> {
    const token = this.verificationTokens.generateToken();
    const tokenHash = this.verificationTokens.hashToken(token);

    const ttlSeconds = this.config.get<number>('emailVerification.ttlSeconds') ?? 86400;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.verificationTokens.invalidatePreviousForUser(userId);

    await this.verificationTokens.create({
      userId,
      email,
      tokenHash,
      expiresAt,
    });

    const baseUrl = this.config.get<string>('emailVerification.baseUrl') ?? 'http://localhost:3000/api';
    const link = `${baseUrl.replace(/\/$/, '')}/auth/email/verify?token=${encodeURIComponent(token)}`;

    const emailOptions: VerificationEmailOptions = { token, link };
    if (displayName !== undefined) {
      emailOptions.userDisplayName = displayName;
    } else if (metadata.userDisplayName !== undefined) {
      emailOptions.userDisplayName = metadata.userDisplayName;
    }
    await this.emailTransport.sendVerificationEmail(email, emailOptions);

    await this.auditService.logSecurityEvent(userId, 'EMAIL_VERIFICATION_SENT', 'LOW', metadata);

    return { email };
  }

  async verifyEmail(rawToken: string, metadata: VerifyEmailMetadata = {}): Promise<UserResponseDto> {
    const tokenHash = this.verificationTokens.hashToken(rawToken);
    const token = await this.verificationTokens.findByTokenHash(tokenHash);

    if (!token || token.verifiedAt) {
      throw new NotFoundException('Verification token not found');
    }

    if (token.expiresAt.getTime() <= Date.now()) {
      throw new ForbiddenException('Verification token expired');
    }

    await this.verificationTokens.markVerified(token.id);

    const existingUser = await this.userRepository.findById(token.userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const previousValue = {
      emailVerified: existingUser.emailVerified,
      status: existingUser.status,
    };

    const updatedUser = await this.userRepository.save({
      ...existingUser,
      emailVerified: true,
      status: existingUser.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : existingUser.status,
    } as User);

    // status may have moved PENDING_VERIFICATION -> ACTIVE; drop the cached
    // auth state so the guard sees it on the very next request.
    await this.userState.invalidate(updatedUser.id);

    const newValue = {
      emailVerified: updatedUser.emailVerified,
      status: updatedUser.status,
    };

    await this.auditService.logAudit(
      'EMAIL_VERIFIED',
      updatedUser.id,
      'User',
      updatedUser.id,
      previousValue as Prisma.InputJsonValue,
      newValue as Prisma.InputJsonValue,
      metadata,
    );

    return this.toUserResponse(updatedUser);
  }

  async resendVerification(email: string, metadata: SendVerificationMetadata = {}): Promise<SendVerificationResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.emailVerified) {
      throw new NotFoundException('User not found or already verified');
    }

    const displayName = user.displayName ?? user.name ?? metadata.userDisplayName;
    await this.sendVerification(user.id, user.email, displayName, metadata);
    return { email: user.email };
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
