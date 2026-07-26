import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import type { SignedUrlDto } from './dto';

@Injectable()
export class SignedUrlService {
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('storage.signingSecret') || this.config.get<string>('jwt.accessSecret');
    if (!secret) throw new Error('JWT access secret must be defined for signed URLs');
    this.secret = secret;
  }

  generateUploadUrl(path: string, userId: string, expiresInSeconds = 3600): SignedUrlDto {
    const expiry = Date.now() + expiresInSeconds * 1000;
    const payload = `${userId}:${path}:${expiry}`;
    const signature = this.sign(payload);

    return {
      url: `/api/storage/upload?path=${encodeURIComponent(path)}&token=${encodeURIComponent(signature)}&exp=${expiry}&uid=${encodeURIComponent(userId)}`,
      expiresIn: expiresInSeconds,
      method: 'POST',
    };
  }

  generateDownloadUrl(path: string, expiresInSeconds = 3600): SignedUrlDto {
    const expiry = Date.now() + expiresInSeconds * 1000;
    const payload = `${path}:${expiry}`;
    const signature = this.sign(payload);

    return {
      url: `/api/storage/${encodeURIComponent(path)}?token=${encodeURIComponent(signature)}&exp=${expiry}`,
      expiresIn: expiresInSeconds,
      method: 'GET',
    };
  }

  verifyUploadToken(token: string, userId: string, path: string, expiry: number): boolean {
    if (Date.now() > expiry) return false;
    const payload = `${userId}:${path}:${expiry}`;
    const expected = this.sign(payload);
    return this.constantTimeCompare(token, expected);
  }

  verifyDownloadToken(token: string, path: string, expiry: number): boolean {
    if (Date.now() > expiry) return false;
    const payload = `${path}:${expiry}`;
    const expected = this.sign(payload);
    return this.constantTimeCompare(token, expected);
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
