import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { AuthResponseDto, LoginDto, RefreshAccessTokenDto, RegisterDto, UserResponseDto } from './dto';
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
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
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
    @Body('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.exchangeCode(code, response);
  }

  @Post('logout')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await this.authService.logout(refreshToken, response);
    }
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
}
