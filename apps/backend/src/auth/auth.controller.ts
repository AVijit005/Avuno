import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { AuthResponseDto, ExchangeCodeDto, ForgotPasswordDto, LoginDto, RegisterDto, UserResponseDto } from './dto';
import type { AccessTokenPayload } from './services/jwt-token.service';
import { REFRESH_TOKEN_COOKIE, CookieService } from './services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto, request.ip, request.headers['user-agent'] as string | undefined, response);
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
    return this.authService.refresh(
      refreshToken,
      request.ip,
      request.headers['user-agent'] as string | undefined,
      response,
    );
  }

  @Post('exchange')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async exchange(
    @Body() dto: ExchangeCodeDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.exchangeCode(dto.code, response);
  }

  @Post('logout')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];

    // This route is intentionally unguarded so a user with an already-expired
    // access token can still end their session. The bearer token is therefore
    // read opportunistically: when present and valid it is denylisted, so the
    // credential stops working immediately rather than at natural expiry.
    const accessTokenPayload = this.authService.tryDecodeAccessToken(request.headers.authorization);

    // Always call through: clearing the cookie and denylisting the access
    // token must happen even when no refresh cookie was sent.
    await this.authService.logout(refreshToken, response, accessTokenPayload);
  }

  @Post('logout-all')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: AccessTokenPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll(user.sub, response);
  }

  @Get('me')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AccessTokenPayload): Promise<UserResponseDto> {
    return this.authService.me(user.sub);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.logForgotPasswordRequest(dto.email);
    // Deliberately identical whether or not the address is registered.
    return { message: 'If an account exists, a reset link has been sent.' };
  }
}
