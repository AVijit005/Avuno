import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

const JTI_PREFIX = 'revoked:jti:';
const USER_EPOCH_PREFIX = 'revoked:user:';

/**
 * Makes access tokens revocable.
 *
 * Access tokens are stateless JWTs, so logging out previously revoked only the
 * refresh token: a stolen access token stayed valid for its full lifetime
 * (default 15 minutes) even after the user hit "log out all devices". The same
 * gap meant a demoted admin kept admin rights, and a suspended or deleted user
 * kept full access, until natural expiry.
 *
 * Two complementary mechanisms:
 *
 *  - Per-token: a `jti` claim is denylisted on logout. Used when we know the
 *    exact token being retired.
 *  - Per-user epoch: a timestamp after which every token issued earlier is
 *    rejected. Used for logout-all, suspension, password change and role
 *    change, where the individual jti values are unknown.
 *
 * Both entries expire automatically after the maximum access-token lifetime,
 * so the denylist stays small and bounded regardless of user count.
 */
@Injectable()
export class TokenRevocationService {
  private readonly logger = new Logger(TokenRevocationService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  private get accessTokenTtlSeconds(): number {
    return this.config.get<number>('jwt.accessExpirySeconds') ?? 900;
  }

  /**
   * Revoke a single access token.
   *
   * TTL is the token's own remaining life: once it expires naturally, JWT
   * verification rejects it anyway and the denylist entry is redundant.
   */
  async revokeToken(jti: string, expiresAtEpochSeconds?: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const ttl = expiresAtEpochSeconds ? Math.max(1, expiresAtEpochSeconds - now) : this.accessTokenTtlSeconds;

    try {
      await this.redis.getClient().set(`${JTI_PREFIX}${jti}`, '1', 'EX', ttl);
    } catch (error) {
      // Fail loudly in logs: a silent failure here means a "logged out" token
      // silently keeps working.
      this.logger.error(`Failed to denylist token ${jti}`, error as Error);
      throw error;
    }
  }

  /**
   * Revoke every access token issued to a user before now.
   *
   * One second is added because `iat` has second granularity: a token minted
   * in the same second as the revocation would otherwise survive it.
   */
  async revokeAllForUser(userId: string): Promise<void> {
    const cutoff = Math.floor(Date.now() / 1000) + 1;
    try {
      await this.redis
        .getClient()
        .set(`${USER_EPOCH_PREFIX}${userId}`, String(cutoff), 'EX', this.accessTokenTtlSeconds);
    } catch (error) {
      this.logger.error(`Failed to set revocation epoch for user ${userId}`, error as Error);
      throw error;
    }
  }

  /**
   * True when the token must be rejected.
   *
   * Fails CLOSED on Redis errors. An unavailable denylist cannot be
   * distinguished from an empty one, and treating a revoked token as valid is
   * the worse outcome.
   */
  async isRevoked(payload: { jti?: string; sub?: string; iat?: number }): Promise<boolean> {
    const client = this.redis.getClient();

    try {
      if (payload.jti) {
        const denied = await client.exists(`${JTI_PREFIX}${payload.jti}`);
        if (denied) return true;
      }

      if (payload.sub && typeof payload.iat === 'number') {
        const raw = await client.get(`${USER_EPOCH_PREFIX}${payload.sub}`);
        if (raw) {
          const cutoff = Number(raw);
          if (Number.isFinite(cutoff) && payload.iat < cutoff) return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error('Revocation check failed; rejecting token', error as Error);
      return true;
    }
  }
}
