import { Injectable } from '@nestjs/common';
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
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super();
    const secret = this.config.get<string>('oauth.encryptionKey');
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('OAuth encryption key is required in production');
    }
    const finalSecret = secret || 'default_secret_key_32_bytes_long!';
    this.encryptionKey = Buffer.from(finalSecret.padEnd(32, '0').slice(0, 32));
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
    } catch {
      console.warn('Failed to decrypt OAuth token (encryption key may have changed). Ignoring old token.');
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
