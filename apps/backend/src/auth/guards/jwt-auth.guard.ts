import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtTokenService, type AccessTokenPayload } from '../services/jwt-token.service';
import { TokenRevocationService } from '../services/token-revocation.service';
import { UserStateService } from '../services/user-state.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly tokenRevocation: TokenRevocationService,
    private readonly userState: UserStateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AccessTokenPayload }>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authHeader.substring(7);

    let payload: AccessTokenPayload;
    try {
      payload = this.jwtTokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    // `sub` must be a non-empty string. Prisma omits `undefined` fields from a
    // WHERE clause, so a token without a subject would turn every
    // `where: { id, userId }` ownership check into an unscoped `where: { id }`
    // and silently defeat the authorization model.
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('Invalid access token');
    }

    // A valid signature is not sufficient. The token may have been revoked by
    // a logout, a "log out everywhere", or a role change since it was issued.
    if (await this.tokenRevocation.isRevoked(payload)) {
      throw new UnauthorizedException('Access token has been revoked');
    }

    // The account itself may have been suspended or deleted. Without this the
    // holder keeps full access until the token expires naturally.
    const state = await this.userState.getState(payload.sub);
    if (!state) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (state.deleted) {
      throw new UnauthorizedException('Account no longer exists');
    }
    if (state.status !== 'ACTIVE' && state.status !== 'PENDING_VERIFICATION') {
      throw new UnauthorizedException('Account is not active');
    }

    // Authorization reads the role from the database, not the token, so a
    // demotion takes effect immediately rather than at expiry.
    request.user = { ...payload, role: state.role };
    return true;
  }
}
