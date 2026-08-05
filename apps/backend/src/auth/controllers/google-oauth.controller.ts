import { Controller, Get, Req, Res, UseGuards, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { randomUUID, createHash } from 'crypto';
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
    
    const hash = createHash('sha256').update(`${request.ip}:${request.headers['user-agent'] || ''}`).digest('hex');
    await this.redis.getClient().set(`oauth:state:${hash}`, JSON.stringify({ state: stateId, returnTo }), 'EX', 300);
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
    const hash = createHash('sha256').update(`${request.ip}:${request.headers['user-agent'] || ''}`).digest('hex');
    const redisClient = this.redis.getClient();
    const savedStateStr = await redisClient.get(`oauth:state:${hash}`);
    
    let savedState = savedStateStr;
    let returnTo = this.config.get<string>('frontendUrl') || 'https://www.avuno.xyz';
    
    if (savedStateStr) {
      try {
        const parsed = JSON.parse(savedStateStr);
        savedState = parsed.state;
        if (parsed.returnTo) returnTo = parsed.returnTo;
      } catch (e) {
        // Fallback for old plain-string format
      }
    }
    
    if (!state || state !== savedState) {
      throw new UnauthorizedException('Invalid OAuth state');
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
