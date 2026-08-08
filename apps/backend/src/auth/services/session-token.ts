import { createHash, timingSafeEqual } from 'crypto';

/**
 * Sessions store a hash of the refresh token, never the token itself.
 *
 * RefreshTokenService already hashed its own copy, but SessionService was
 * handed the same raw token and wrote it verbatim to `sessions.token`. That
 * negated the hashing entirely: a read-only SQL injection, a leaked replica or
 * an unencrypted pg_dump yielded directly replayable credentials for every
 * active user.
 *
 * Plain SHA-256 (not a password KDF) is the right primitive here: the input is
 * an opaque 256-bit random token, so there is no low-entropy guess space for
 * an attacker to brute-force, and lookups must stay a single indexed query.
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time comparison of a raw token against a stored hash.
 *
 * Used for the "is this my current session?" flag. A plain === on the hashes
 * would leak, via timing, how many leading characters matched.
 */
export function sessionTokenMatches(rawToken: string | undefined, storedHash: string): boolean {
  if (!rawToken) return false;
  const candidate = Buffer.from(hashSessionToken(rawToken), 'hex');
  let stored: Buffer;
  try {
    stored = Buffer.from(storedHash, 'hex');
  } catch {
    return false;
  }
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}
