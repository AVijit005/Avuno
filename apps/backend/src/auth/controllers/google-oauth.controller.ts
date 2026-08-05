import { Controller, Get, Req, Res, UseGuards, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';
import { RedisService } from '../../redis/redis.service';

interface OAuthUserPayload {
  sub: string;
  email: string;
}

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private redis: RedisService) {
    super();
  }
  async getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const stateId = randomUUID();
    
    // Check if request came from localhost for local development (Enterprise Grade Security)
    const referer = request.headers.referer || request.headers.origin || '';
    const isLocalAllowed = process.env.ALLOW_LOCAL_DEV_REDIRECT === 'true';
    const returnTo = (isLocalAllowed && referer.startsWith('http://localhost:5173')) 
      ? 'http://localhost:5173' 
      : 'https://www.avuno.xyz';
    
    // Store state using the UUID itself as key (IP hashing breaks behind Cloudflare proxy)
    await this.redis.getClient().set(`oauth:state:${stateId}`, JSON.stringify({ returnTo }), 'EX', 300);
    return { state: stateId };
  }
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
  @UseGuards(GoogleOAuthGuard)
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
    const state = (request.query as any).state;
    if (!state) {
      throw new UnauthorizedException('Missing OAuth state');
    }
    
    const redisClient = this.redis.getClient();
    const savedStateStr = await redisClient.get(`oauth:state:${state}`);
    
    if (!savedStateStr) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
    
    // Delete state immediately to prevent replay attacks (one-time use)
    await redisClient.del(`oauth:state:${state}`);
    
    let returnTo = this.config.get<string>('frontendUrl') || 'https://www.avuno.xyz';
    try {
      const parsed = JSON.parse(savedStateStr);
      if (parsed.returnTo) returnTo = parsed.returnTo;
    } catch (e) {
      // Use default returnTo
    }
    
    const user = (request as any).user as OAuthUserPayload;
    const authResult = await this.authService.finishOAuthLogin(
      user,
      request.ip,
      request.headers['user-agent'] as string | undefined,
    );
    
    const code = randomUUID();
    await redisClient.set(`oauth:code:${code}`, JSON.stringify(authResult), 'EX', 30);
    
    response.redirect(`${returnTo}/auth/callback?code=${encodeURIComponent(code)}`);
  }
}

