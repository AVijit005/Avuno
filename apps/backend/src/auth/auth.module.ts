import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared';
import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { GoogleOAuthController, EmailVerificationController } from './controllers';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { EmailVerificationTokenRepository, OAuthAccountRepository } from './repositories';
import { JwtAuthGuard, GoogleOAuthGuard } from './guards';
import { GoogleStrategy } from './strategies/google.strategy';
import {
  ConsoleEmailTransportService,
  CookieService,
  EmailVerificationService,
  JwtTokenService,
  PasswordService,
  RefreshTokenService,
  SessionService,
  TokenFactory,
  VerificationTokenService,
  GoogleOAuthService,
  AuthAuditService,
  ResendEmailTransportService,
  OAuthStateService,
  EMAIL_TRANSPORT,
} from './services';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SharedModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, GoogleOAuthController, EmailVerificationController],
  providers: [
    AuthService,
    AuthRepository,
    OAuthAccountRepository,
    EmailVerificationTokenRepository,
    PasswordService,
    JwtTokenService,
    RefreshTokenService,
    SessionService,
    TokenFactory,
    CookieService,
    VerificationTokenService,
    EmailVerificationService,
    GoogleOAuthService,
    GoogleStrategy,
    OAuthStateService,
    GoogleOAuthGuard,
    AuthAuditService,
    ConsoleEmailTransportService,
    JwtAuthGuard,
    ResendEmailTransportService,
    {
      provide: EMAIL_TRANSPORT,
      inject: [ConfigService, ResendEmailTransportService, ConsoleEmailTransportService],
      useFactory: (
        config: ConfigService,
        resend: ResendEmailTransportService,
        console: ConsoleEmailTransportService,
      ) => {
        const env = config.get('NODE_ENV') || config.get('nodeEnv') || process.env.NODE_ENV;
        return env === 'development' || env === 'test' ? console : resend;
      },
    },
  ],
  exports: [JwtTokenService, AuthService, JwtAuthGuard, CookieService, EmailVerificationService, GoogleOAuthService],
})
export class AuthModule {}
