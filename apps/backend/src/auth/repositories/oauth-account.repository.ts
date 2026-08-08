import { Injectable, Logger } from '@nestjs/common';
import { OAuthAccount, OAuthProvider, Prisma } from '@prisma/client';
import { BaseRepository } from '../../core';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export interface CreateOAuthAccountData {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  expiresAt?: Date | null;
}

@Injectable()
export class OAuthAccountRepository extends BaseRepository<OAuthAccount> {
  private readonly logger = new Logger(OAuthAccountRepository.name);
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super();
    this.encryptionKey = OAuthAccountRepository.resolveKey(this.config.get<string>('oauth.encryptionKey'));
  }

  /**
   * Derive the AES-256-GCM key.
   *
   * Previously this fell back to a hardcoded literal
   * ('default_secret_key_32_bytes_long!') that is in the public git history,
   * and the production guard never fired because configuration.ts already
   * substituted a dev default upstream — so `secret` was always truthy.
   *
   * It also did `padEnd(32, '0').slice(0, 32)`, which silently turned a short
   * key into low-entropy padding. A 64-hex-character key is now required so
   * the full 256 bits are real.
   */
  private static resolveKey(secret: string | undefined): Buffer {
    if (!secret) {
      throw new Error('OAUTH_ENCRYPTION_KEY is required. Generate one with: openssl rand -hex 32');
    }

    if (/^[0-9a-fA-F]{64}$/.test(secret)) {
      return Buffer.from(secret, 'hex');
    }

    const raw = Buffer.from(secret, 'utf8');
    if (raw.length === 32) {
      return raw;
    }

    throw new Error(
      'OAUTH_ENCRYPTION_KEY must be 64 hex characters (32 bytes). ' + 'Generate one with: openssl rand -hex 32',
    );
  }

  private encrypt(text: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  }

  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      if (parts.length !== 3) return text;
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = Buffer.from(parts[1], 'hex');
      const authTag = Buffer.from(parts[2], 'hex');
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      return decipher.update(encryptedText) + decipher.final('utf8');
    } catch (error) {
      // A GCM auth-tag mismatch is the signal for tampered ciphertext, so this
      // must be visible rather than swallowed by console.warn. It also fires
      // legitimately after a key rotation, hence warn rather than throw: the
      // caller treats an empty token as "re-authenticate with the provider".
      this.logger.warn(
        `Failed to decrypt an OAuth token: ${(error as Error).message}. ` +
          'Treating it as absent (key rotated, or ciphertext tampered with).',
      );
      return '';
    }
  }

  async findById(id: string): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findUnique({ where: { id } });
    if (account) {
      account.accessToken = account.accessToken ? this.decrypt(account.accessToken) : null;
      account.refreshToken = account.refreshToken ? this.decrypt(account.refreshToken) : null;
    }
    return account;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.oAuthAccount.count({ where: { id } });
    return count > 0;
  }

  async save(entity: OAuthAccount): Promise<OAuthAccount> {
    const { id, ...rest } = entity;
    return this.prisma.oAuthAccount.update({
      where: { id },
      data: rest as Prisma.OAuthAccountUncheckedUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.oAuthAccount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByProviderAndAccountId(provider: OAuthProvider, providerAccountId: string): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
    if (account) {
      account.accessToken = account.accessToken ? this.decrypt(account.accessToken) : null;
      account.refreshToken = account.refreshToken ? this.decrypt(account.refreshToken) : null;
    }
    return account;
  }

  async create(data: CreateOAuthAccountData): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        accessToken: data.accessToken ? this.encrypt(data.accessToken) : null,
        refreshToken: data.refreshToken ? this.encrypt(data.refreshToken) : null,
        tokenType: data.tokenType ?? null,
        scope: data.scope ?? null,
        idToken: data.idToken ?? null,
        expiresAt: data.expiresAt ?? null,
      },
    });
  }
}
