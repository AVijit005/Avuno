import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { randomUUID } from 'crypto';

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
    const user = (request as any).user as OAuthUserPayload;
    const authResult = await this.authService.finishOAuthLogin(
      user,
      request.ip,
      request.headers['user-agent'] as string | undefined,
    );
    
    const code = randomUUID();
    await this.redis.getClient().set(`oauth:code:${code}`, JSON.stringify(authResult), 'EX', 30);
    
    const frontendUrl = this.config.get<string>('frontendUrl') || 'https://www.avuno.xyz';
    response.redirect(`${frontendUrl}/auth/callback?code=${encodeURIComponent(code)}`);
  }
}

