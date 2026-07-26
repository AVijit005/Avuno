import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { ConflictException, NotFoundException } from '../common';
import { AuthRepository } from './auth.repository';
import { AuthResponseDto, LoginDto, RegisterDto, UserResponseDto } from './dto';
import { RedisService } from '../redis/redis.service';
import {
  CookieService,
  EmailVerificationService,
  JwtTokenService,
  PasswordService,
  RefreshTokenService,
  SessionService,
} from './services';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionService,
    private readonly cookieService: CookieService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(
    dto: RegisterDto,
    metadata: { ipAddress?: string; userAgent?: string } = {},
  ): Promise<UserResponseDto> {
    const passwordHash = await this.passwordService.hash(dto.password);
    let user;
    try {
      user = await this.authRepository.create({
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        name: dto.name,
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Email already registered');
      throw e;
    }

    await this.emailVerificationService.sendVerification(user.id, user.email, user.name ?? undefined, metadata);

    return this.toUserResponse(user);
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string, response?: Response): Promise<AuthResponseDto> {
    const emailKey = `auth:attempts:${dto.email.toLowerCase().trim()}`;
    const ipKey = `auth:attempts:ip:${ipAddress || 'unknown'}`;
    const redisClient = this.redis.getClient();
    
    const attempts = parseInt((await redisClient.get(emailKey)) || '0', 10);
    const ipAttempts = parseInt((await redisClient.get(ipKey)) || '0', 10);
    if (attempts >= MAX_LOGIN_ATTEMPTS || ipAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedKey = attempts >= MAX_LOGIN_ATTEMPTS ? emailKey : ipKey;
      const ttl = await redisClient.ttl(lockedKey);
      const minutes = Math.ceil(ttl / 60);
      throw new ForbiddenException(`Account temporarily locked. Try again in ${minutes} minutes.`);
    }

    const user = await this.authRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      await this.recordFailedAttempt(emailKey);
      await this.recordFailedAttempt(ipKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.recordFailedAttempt(emailKey);
      await this.recordFailedAttempt(ipKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    await redisClient.del(emailKey);
    await redisClient.del(ipKey);

    const verificationRequired = String(this.config.get('emailVerification.required')) !== 'false';
    if (verificationRequired && !user.emailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    await this.authRepository.updateLastLogin(user.id);

    const { token: refreshToken } = await this.refreshTokenService.create(user.id);
    await this.sessionService.create(user.id, ipAddress, userAgent, refreshToken);
    const { accessToken, expiresIn } = this.jwtTokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    if (response) {
      const refreshExpirySeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      this.cookieService.writeRefreshToken(response, refreshToken, refreshExpirySeconds);
    }

    return {
      user: this.toUserResponse(user),
      accessToken,
      expiresIn,
    };
  }

  async refresh(
    refreshToken: string | undefined,
    ipAddress?: string,
    userAgent?: string,
    response?: Response,
  ): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    // Validate session FIRST before rotating token
    // This prevents orphaned tokens if session is invalid
    const session = await this.sessionService.validate(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Session invalid or expired');
    }

    // Now rotate the token (atomic transaction)
    const { token: newRefreshToken, refreshToken: stored } = await this.refreshTokenService.rotate(refreshToken);

    // Invalidate old session and create new one
    await this.sessionService.invalidateByToken(refreshToken);
    await this.sessionService.create(stored.userId, ipAddress, userAgent, newRefreshToken);

    const user = await this.authRepository.findById(stored.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, expiresIn } = this.jwtTokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    if (response) {
      const refreshExpirySeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      this.cookieService.writeRefreshToken(response, newRefreshToken, refreshExpirySeconds);
    }

    return {
      user: this.toUserResponse(user),
      accessToken,
      expiresIn,
    };
  }

  async logout(refreshToken: string | undefined, response?: Response): Promise<void> {
    if (refreshToken) {
      await this.refreshTokenService.revoke(refreshToken);
      await this.sessionService.invalidateByToken(refreshToken);
    }
    if (response) {
      this.cookieService.clearRefreshToken(response);
    }
  }

  async logoutAll(userId: string, response?: Response): Promise<void> {
    await this.refreshTokenService.revokeAllForUser(userId);
    await this.sessionService.invalidateAllForUser(userId);
    if (response) {
      this.cookieService.clearRefreshToken(response);
    }
  }

  async finishOAuthLogin(
    user: { sub: string; email: string },
    ipAddress?: string,
    userAgent?: string,
    response?: Response,
  ): Promise<AuthResponseDto> {
    const dbUser = await this.authRepository.findById(user.sub);
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    if (!dbUser.emailVerified) {
      dbUser.emailVerified = true;
      await this.authRepository.save(dbUser);
    }

    await this.authRepository.updateLastLogin(dbUser.id);

    const { token: refreshToken } = await this.refreshTokenService.create(dbUser.id);
    await this.sessionService.create(dbUser.id, ipAddress, userAgent, refreshToken);
    const { accessToken, expiresIn } = this.jwtTokenService.signAccessToken({
      sub: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    });

    if (response) {
      const refreshExpirySeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      this.cookieService.writeRefreshToken(response, refreshToken, refreshExpirySeconds);
    }

    return {
      user: this.toUserResponse(dbUser),
      accessToken,
      expiresIn,
      refreshToken,
    } as any;
  }

  async exchangeCode(code: string, response: Response): Promise<AuthResponseDto> {
    const redisClient = this.redis.getClient();
    const dataStr = await redisClient.get(`oauth:code:${code}`);
    if (!dataStr) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    await redisClient.del(`oauth:code:${code}`);

    const data = JSON.parse(dataStr);

    if (data.refreshToken) {
      const refreshExpirySeconds = this.config.get<number>('jwt.refreshExpirySeconds') ?? 604800;
      this.cookieService.writeRefreshToken(response, data.refreshToken, refreshExpirySeconds);
    }

    return {
      user: data.user,
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
    };
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserResponse(user);
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async recordFailedAttempt(key: string): Promise<void> {
    const redisClient = this.redis.getClient();
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, LOCKOUT_MINUTES * 60);
    }
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      await redisClient.expire(key, LOCKOUT_MINUTES * 60);
    }
  }
}
