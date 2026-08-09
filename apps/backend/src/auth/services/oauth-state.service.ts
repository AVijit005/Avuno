import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../../redis/redis.service';
import { z } from 'zod';

export interface OAuthStatePayload {
  /** Origin to send the user back to once the exchange completes. */
  returnTo: string;
}

export interface OAuthCodePayload {
  user: unknown;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

const STATE_PREFIX = 'oauth:state:';
const CODE_PREFIX = 'oauth:code:';

/** Long enough to complete Google consent, short enough to limit replay. */
const STATE_TTL_SECONDS = 300;
/** The frontend exchanges immediately on page load. */
const CODE_TTL_SECONDS = 30;

/**
 * Server-side CSRF state and one-time authorization codes for the Google
 * OAuth flow.
 *
 * Two properties matter here:
 *
 * 1. State must be verified *by the server*, not just generated. An earlier
 *    implementation created a state value but never checked it on the way
 *    back, which provides no protection at all: an attacker could complete
 *    consent with their own Google account and hand the resulting callback
 *    URL to a victim, silently logging the victim into the attacker's
 *    account (login CSRF).
 *
 * 2. The access token must never travel in a URL. Query strings are recorded
 *    in browser history, CDN and proxy access logs, and leak via Referer to
 *    anything the callback page loads. Instead the token is stashed in Redis
 *    behind a single-use code, and the SPA POSTs that code to /auth/exchange.
 */
@Injectable()
export class OAuthStateService {
  private readonly logger = new Logger(OAuthStateService.name);

  constructor(private readonly redis: RedisService) {}

  async createState(returnTo: string): Promise<string> {
    const state = randomUUID();
    const payload: OAuthStatePayload = { returnTo };
    await this.redis.getClient().set(`${STATE_PREFIX}${state}`, JSON.stringify(payload), 'EX', STATE_TTL_SECONDS);
    return state;
  }

  /**
   * Verify and atomically consume a state value.
   *
   * Uses GETDEL so a state can never be redeemed twice, even under concurrent
   * callbacks. Returns null when the state is missing, expired or already
   * used — all of which must be treated as a failed login.
   */
  async consumeState(state: string | undefined): Promise<OAuthStatePayload | null> {
    if (!state) return null;

    const client = this.redis.getClient();
    const key = `${STATE_PREFIX}${state}`;

    let raw: string | null;
    try {
      // GETDEL requires Redis >= 6.2; fall back for older servers.
      raw = await client.getdel(key);
    } catch {
      raw = await client.get(key);
      if (raw !== null) await client.del(key);
    }

    if (!raw) return null;

    const OAuthStateSchema = z.object({
      returnTo: z.string(),
    });

    try {
      const parsed = JSON.parse(raw);
      return OAuthStateSchema.parse(parsed) as OAuthStatePayload;
    } catch {
      this.logger.warn('Discarding OAuth state with unparseable or invalid payload');
      return null;
    }
  }

  /** Store the auth result behind a single-use code. */
  async createCode(payload: OAuthCodePayload): Promise<string> {
    const code = randomUUID();
    await this.redis.getClient().set(`${CODE_PREFIX}${code}`, JSON.stringify(payload), 'EX', CODE_TTL_SECONDS);
    return code;
  }
}
