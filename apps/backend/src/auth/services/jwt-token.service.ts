import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role?: string;
}

/**
 * The verified token, including the registered claims the signer adds.
 *
 * `jti` makes an individual token revocable and `iat` supports per-user
 * epoch revocation; see TokenRevocationService.
 */
export interface AccessTokenPayload extends AccessTokenClaims {
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(payload: AccessTokenClaims): TokenPair {
    const expiresIn = this.config.get<number>('jwt.accessExpirySeconds') ?? 900;
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn,
      // Unique per token so logout can denylist this exact credential rather
      // than waiting for it to expire.
      jwtid: randomUUID(),
    });
    return { accessToken, expiresIn };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, {
      secret: this.config.get<string>('jwt.accessSecret'),
      algorithms: ['HS256'],
    });
  }
}
