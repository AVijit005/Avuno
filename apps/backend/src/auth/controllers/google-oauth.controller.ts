import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { AuthResponseDto } from '../dto';

interface OAuthUserPayload {
  sub: string;
  email: string;
}

@Controller('auth')
export class GoogleOAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Passport redirects to Google; no body needed.
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const user = (request as any).user as OAuthUserPayload;
    const authResult = await this.authService.finishOAuthLogin(
      user,
      request.ip,
      request.headers['user-agent'] as string | undefined,
      response,
    );
    const rawUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'https://www.avuno.xyz';
    const frontendUrl = (rawUrl.includes('yourdomain') || !rawUrl.startsWith('http')) ? 'https://www.avuno.xyz' : rawUrl.replace(/\/api\/?$/, '');
    response.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(authResult.accessToken)}`);
  }
}
