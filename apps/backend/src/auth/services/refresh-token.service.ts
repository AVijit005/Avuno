import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { RefreshToken } from '@prisma/client';
import { ForbiddenException } from '../../common';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenFactory } from './token.factory';

export interface RefreshTokenResult {
  token: string;
  refreshToken: RefreshToken;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokenFactory: TokenFactory,
  ) {}

  async create(userId: string): Promise<RefreshTokenResult> {
    const token = this.tokenFactory.generateSecureToken();
    const tokenHash = this.hashToken(token);
    const expiresSeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000);

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { token, refreshToken };
  }

  async rotate(token: string): Promise<RefreshTokenResult> {
    const tokenHash = this.hashToken(token);

    // Atomic rotate: find + revoke + create in a single transaction
    // This prevents TOCTOU race conditions where two concurrent requests
    // both read the same unrevoked token and both succeed.
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!existing || existing.expiresAt < new Date()) {
        throw new ForbiddenException('Refresh token invalid or expired');
      }

      // Revoke the old token atomically using updateMany as a lock
      const updateResult = await tx.refreshToken.updateMany({
        where: { id: existing.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (updateResult.count === 0) {
        // If count is 0, it was already revoked by a concurrent request
        throw new ForbiddenException('Refresh token invalid or expired');
      }

      // Create the new token in the same transaction
      const newToken = this.tokenFactory.generateSecureToken();
      const newTokenHash = this.hashToken(newToken);
      const expiresSeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      const expiresAt = new Date(Date.now() + expiresSeconds * 1000);

      const newRefreshToken = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      return { token: newToken, refreshToken: newRefreshToken };
    });

    return result;
  }

  async rotateWithSession(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResult> {
    const tokenHash = this.hashToken(token);

    // Atomic rotate with session management in a single transaction
    // This prevents partial state if session operations fail after token rotation
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!existing || existing.expiresAt < new Date()) {
        throw new ForbiddenException('Refresh token invalid or expired');
      }

      // Revoke the old token atomically using updateMany as a lock
      const updateResult = await tx.refreshToken.updateMany({
        where: { id: existing.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (updateResult.count === 0) {
        // If count is 0, it was already revoked by a concurrent request
        throw new ForbiddenException('Refresh token invalid or expired');
      }

      // Create the new token
      const newToken = this.tokenFactory.generateSecureToken();
      const newTokenHash = this.hashToken(newToken);
      const expiresSeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      const expiresAt = new Date(Date.now() + expiresSeconds * 1000);

      const newRefreshToken = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      // Invalidate old session in the same transaction
      await tx.session.updateMany({
        where: { token },
        data: { status: 'REVOKED' },
      });

      // Create new session atomically
      const ttlSeconds = this.config.get<number>('session.ttlSeconds') ?? 604800;
      const sessionExpiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await tx.session.create({
        data: {
          userId: existing.userId,
          token: newToken,
          expiresAt: sessionExpiresAt,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          status: 'ACTIVE',
        },
      });

      return { token: newToken, refreshToken: newRefreshToken };
    });

    return result;
  }

  async revoke(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
