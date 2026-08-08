import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { OAuthStateService } from '../services/oauth-state.service';

/**
 * Issues a server-side CSRF state before redirecting to Google.
 *
 * Passport's built-in state store is disabled (see GoogleStrategy) because it
 * requires express-session, which conflicts with this app's stateless JWT
 * setup. State is kept in Redis instead, keyed by an opaque UUID — notably
 * NOT keyed by client IP, which is unreliable behind Cloudflare.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly oauthState: OAuthStateService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async getAuthenticateOptions(context: ExecutionContext): Promise<{ state: string }> {
    const request = context.switchToHttp().getRequest<Request>();

    const state = await this.oauthState.createState(this.resolveReturnTo(request));
    return { state };
  }

  /**
   * Where to send the user after the exchange. Only an explicit opt-in allows
   * the localhost origin, so the redirect target can never be attacker-chosen.
   */
  private resolveReturnTo(request: Request): string {
    const configured = this.config.get<string>('frontendUrl')?.trim() || 'https://www.avuno.xyz';

    if (process.env.ALLOW_LOCAL_DEV_REDIRECT !== 'true') {
      return configured;
    }

    const referer = String(request.headers.referer || request.headers.origin || '');
    return referer.startsWith('http://localhost:5173') ? 'http://localhost:5173' : configured;
  }
}
