import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { OAuthStateService } from '../services/oauth-state.service';

interface OAuthUserPayload {
  sub: string;
  email: string;
}

@Controller('auth')
export class GoogleOAuthController {
  private readonly logger = new Logger(GoogleOAuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly oauthState: OAuthStateService,
  ) {}

  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(GoogleOAuthGuard)
  googleAuth(): void {
    // GoogleOAuthGuard mints the CSRF state and redirects to Google.
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    const fallbackUrl = this.frontendUrl();

    // Verify and consume the CSRF state BEFORE issuing any credential.
    // Google echoes back the `state` we sent; if it is missing, expired or
    // already used, this callback did not originate from a login we started.
    const state = typeof request.query.state === 'string' ? request.query.state : undefined;
    const statePayload = await this.oauthState.consumeState(state);

    if (!statePayload) {
      this.logger.warn('Rejected Google OAuth callback with missing or invalid state');
      response.redirect(`${fallbackUrl}/auth?error=invalid_state`);
      return;
    }

    const user = (request as Request & { user?: OAuthUserPayload }).user;
    if (!user) {
      response.redirect(`${fallbackUrl}/auth?error=oauth_failed`);
      return;
    }

    const authResult = await this.authService.finishOAuthLogin(
      user,
      request.ip,
      request.headers['user-agent'] as string | undefined,
    );

    // Hand back a single-use code rather than the JWT itself. The token must
    // never appear in a URL: query strings persist in browser history, CDN
    // and proxy logs, and leak through Referer.
    const code = await this.oauthState.createCode({
      user: authResult.user,
      accessToken: authResult.accessToken,
      expiresIn: authResult.expiresIn,
      refreshToken: (authResult as { refreshToken?: string }).refreshToken,
    });

    const returnTo = statePayload.returnTo || fallbackUrl;
    response.redirect(`${returnTo}/auth/callback?code=${encodeURIComponent(code)}`);
  }

  private frontendUrl(): string {
    const allowLocal = process.env.ALLOW_LOCAL_DEV_REDIRECT === 'true';
    if (allowLocal) return 'http://localhost:5173';
    return this.config.get<string>('frontendUrl')?.trim() || 'https://www.avuno.xyz';
  }
}
