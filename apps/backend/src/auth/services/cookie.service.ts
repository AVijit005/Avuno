import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';

export const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  writeRefreshToken(response: Response, token: string, maxAgeSeconds: number): void {
    const isProduction = this.config.get<string>('nodeEnv') === 'production';
    response.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: maxAgeSeconds * 1000,
      domain: this.config.get<string>('cookie.domain') || undefined,
    });
  }

  readRefreshToken(request: Request): string | undefined {
    return request.cookies?.[REFRESH_TOKEN_COOKIE];
  }

  clearRefreshToken(response: Response): void {
    const isProduction = this.config.get<string>('nodeEnv') === 'production';
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth',
      domain: this.config.get<string>('cookie.domain') || undefined,
    });
  }
}
