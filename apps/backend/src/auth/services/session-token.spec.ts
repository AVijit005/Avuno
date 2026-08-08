import { describe, it, expect } from 'bun:test';
import { hashSessionToken, sessionTokenMatches } from './session-token';

describe('session token hashing', () => {
  const token = 'a'.repeat(64);

  it('produces a 64-character hex digest', () => {
    const hash = hashSessionToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('never returns the token itself', () => {
    // The whole point: the raw credential must not be recoverable from what
    // is written to the database.
    expect(hashSessionToken(token)).not.toBe(token);
  });

  it('is deterministic, so lookups stay a single indexed query', () => {
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it('separates distinct tokens', () => {
    expect(hashSessionToken('token-a')).not.toBe(hashSessionToken('token-b'));
  });
});

describe('sessionTokenMatches', () => {
  const token = 'session-token-value';
  const storedHash = hashSessionToken(token);

  it('matches the token that produced the hash', () => {
    expect(sessionTokenMatches(token, storedHash)).toBe(true);
  });

  it('rejects a different token', () => {
    expect(sessionTokenMatches('some-other-token', storedHash)).toBe(false);
  });

  it('rejects an undefined token (no refresh cookie present)', () => {
    expect(sessionTokenMatches(undefined, storedHash)).toBe(false);
  });

  it('rejects an empty token', () => {
    expect(sessionTokenMatches('', storedHash)).toBe(false);
  });

  it('rejects a legacy plaintext value left in the column', () => {
    // Rows written before hashing hold the raw token. They must not match,
    // otherwise the migration would be bypassable.
    expect(sessionTokenMatches(token, token)).toBe(false);
  });

  it('does not throw on a malformed stored hash', () => {
    expect(sessionTokenMatches(token, 'not-hex')).toBe(false);
    expect(sessionTokenMatches(token, '')).toBe(false);
  });
});
