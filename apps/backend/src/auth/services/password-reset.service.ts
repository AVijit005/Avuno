import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenFactory } from './token.factory';
import { PasswordService } from './password.service';
import { RefreshTokenService } from './refresh-token.service';
import { SessionService } from './session.service';
import { TokenRevocationService } from './token-revocation.service';
import { UserStateService } from './user-state.service';
import { AuthAuditService } from './auth-audit.service';
import { EMAIL_TRANSPORT, type EmailTransport } from './email-transport.abstraction';

/** Short-lived: a reset link is a full account-takeover primitive. */
const RESET_TTL_MINUTES = 30;

/**
 * Password reset.
 *
 * Previously this did not exist. `POST /auth/forgot-password` added the email
 * to a Redis set and returned "If an account exists, a reset link has been
 * sent." — no email was sent, no token was issued, and there was no endpoint
 * to complete the flow. Users who forgot their password were permanently
 * locked out while being told otherwise. The PasswordResetToken model has been
 * in the schema, unused, the whole time.
 *
 * Properties this implementation holds to:
 *  - 256 bits of entropy, stored only as a SHA-256 hash.
 *  - Single-use, enforced atomically so two concurrent redemptions cannot both
 *    succeed.
 *  - Requesting a reset never reveals whether an address is registered.
 *  - Completing a reset revokes every existing session and access token: if
 *    the reset was triggered because the account was compromised, leaving the
 *    attacker's session alive would defeat the point.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenFactory: TokenFactory,
    private readonly passwordService: PasswordService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly tokenRevocation: TokenRevocationService,
    private readonly userState: UserStateService,
    private readonly auditService: AuthAuditService,
    private readonly config: ConfigService,
    @Inject(EMAIL_TRANSPORT) private readonly emailTransport: EmailTransport,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private resetLink(token: string): string {
    const base = this.config.get<string>('frontendUrl')?.trim().replace(/\/$/, '') || 'https://www.avuno.xyz';
    return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
  }

  /**
   * Issue a reset link.
   *
   * Always resolves, whether or not the address exists — the caller returns an
   * identical response either way, so this cannot be used to enumerate
   * accounts.
   */
  async requestReset(email: string, metadata?: { ipAddress?: string }): Promise<void> {
    const normalised = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalised },
      select: { id: true, name: true, email: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      this.logger.log('Password reset requested for an unknown or deleted address');
      return;
    }

    const token = this.tokenFactory.generateSecureToken(32);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60_000);

    // Invalidate any outstanding tokens: requesting a new link should retire
    // the previous one, so an old email cannot still be redeemed.
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: this.hash(token), expiresAt },
      }),
    ]);

    try {
      await this.emailTransport.sendPasswordResetEmail(user.email, {
        link: this.resetLink(token),
        userDisplayName: user.name ?? undefined,
        expiresInMinutes: RESET_TTL_MINUTES,
      });
    } catch (error) {
      // Do not surface the failure: doing so would reveal that the address
      // exists. The token stays valid so a retry can succeed.
      this.logger.error('Failed to send password reset email', error as Error);
    }

    await this.auditService
      .logSecurityEvent(user.id, 'PASSWORD_RESET_REQUESTED', 'MEDIUM', {
        ipAddress: metadata?.ipAddress,
      })
      .catch(() => undefined);
  }

  /**
   * Complete a reset.
   *
   * The token is consumed atomically: `updateMany` filtered on `usedAt: null`
   * returns a count, so exactly one of two concurrent requests can claim it. A
   * read-then-write would let both through.
   */
  async completeReset(token: string, newPassword: string, metadata?: { ipAddress?: string }): Promise<void> {
    const tokenHash = this.hash(token);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    // One message for every failure mode — expired, already used, never
    // existed — so nothing can be inferred from the response.
    const invalid = new UnauthorizedException('This reset link is invalid or has expired');
    if (!record || record.usedAt || record.expiresAt < new Date()) throw invalid;

    const claimed = await this.prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) throw invalid;

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    // A reset is often a response to compromise. Every existing credential
    // must stop working, including access tokens already in flight.
    await Promise.all([
      this.refreshTokenService.revokeAllForUser(record.userId).catch(() => undefined),
      this.sessionService.invalidateAllForUser(record.userId).catch(() => undefined),
      this.tokenRevocation.revokeAllForUser(record.userId).catch(() => undefined),
      this.userState.invalidate(record.userId).catch(() => undefined),
    ]);

    await this.auditService
      .logSecurityEvent(record.userId, 'PASSWORD_RESET_COMPLETED', 'HIGH', {
        ipAddress: metadata?.ipAddress,
      })
      .catch(() => undefined);

    this.logger.log(`Password reset completed for user ${record.userId}`);
  }
}
