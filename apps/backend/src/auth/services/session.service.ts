import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Session } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenFactory } from './token.factory';
import { hashSessionToken } from './session-token';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokenFactory: TokenFactory,
  ) {}

  async create(userId: string, ipAddress?: string, userAgent?: string, token?: string): Promise<Session> {
    const ttlSeconds = this.config.get<number>('session.ttlSeconds') ?? 604800;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const sessionToken = token ?? this.tokenFactory.generateSecureToken();

    return this.prisma.session.create({
      data: {
        userId,
        // Stored hashed: see session-token.ts. The column keeps its `token`
        // name to avoid a rename migration, but it holds a SHA-256 digest.
        token: hashSessionToken(sessionToken),
        expiresAt,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        status: 'ACTIVE',
      },
    });
  }

  async validate(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { token: hashSessionToken(token) },
    });
    if (!session) return null;
    if (session.status !== 'ACTIVE') return null;
    if (session.expiresAt < new Date()) return null;
    if (session.deletedAt) return null;
    return session;
  }

  async invalidateByToken(token: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { token: hashSessionToken(token) },
      data: { status: 'REVOKED' },
    });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'REVOKED' },
    });
  }
}
