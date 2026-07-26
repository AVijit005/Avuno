import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { AuthResponseDto } from '../dto';
import { randomUUID } from 'crypto';
import { RedisService } from '../../redis/redis.service';

interface OAuthUserPayload {
  sub: string;
  email: string;
}

@Controller('auth')
export class GoogleOAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

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
    );
    
    const code = randomUUID();
    const redisClient = this.redis.getClient();
    await redisClient.set(`oauth:code:${code}`, JSON.stringify(authResult), 'EX', 30);
    
    const frontendUrl = this.config.get<string>('frontendUrl') || 'https://www.avuno.xyz';
    response.redirect(`${frontendUrl}/auth/callback?code=${encodeURIComponent(code)}`);
  }
}
