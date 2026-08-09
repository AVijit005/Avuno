import { describe, it, expect } from 'bun:test';
import { redactUrl } from './redact-url';

describe('redactUrl', () => {
  it('leaves a URL with no query string untouched', () => {
    expect(redactUrl('/api/users/me')).toBe('/api/users/me');
  });

  it('passes through undefined', () => {
    expect(redactUrl(undefined)).toBeUndefined();
  });

  it('redacts the email verification token', () => {
    // 24h account-takeover primitive; previously written to every access log.
    expect(redactUrl('/api/auth/email/verify?token=abc123')).toBe('/api/auth/email/verify?token=[REDACTED]');
  });

  it('redacts the OAuth authorization code', () => {
    expect(redactUrl('/auth/callback?code=uuid-value')).toBe('/auth/callback?code=[REDACTED]');
  });

  it('redacts a signed storage URL signature while keeping the rest', () => {
    expect(redactUrl('/api/storage/file.png?token=sig&exp=123456')).toBe(
      '/api/storage/file.png?token=[REDACTED]&exp=123456',
    );
  });

  it('keeps non-sensitive parameters readable for debugging', () => {
    expect(redactUrl('/api/library?limit=20&status=COMPLETED')).toBe('/api/library?limit=20&status=COMPLETED');
  });

  it('redacts every sensitive parameter in one URL', () => {
    const out = redactUrl('/x?token=a&code=b&state=c&password=d&api_key=e');
    expect(out).not.toContain('=a');
    expect(out).not.toContain('=b');
    expect(out).not.toContain('=c');
    expect(out).not.toContain('=d');
    expect(out).not.toContain('=e');
  });

  it('is case-insensitive on parameter names', () => {
    expect(redactUrl('/x?TOKEN=secret')).toBe('/x?TOKEN=[REDACTED]');
  });

  it('handles a parameter with no value', () => {
    expect(redactUrl('/x?token')).toBe('/x?token=[REDACTED]');
  });

  it('handles an empty query string', () => {
    expect(redactUrl('/x?')).toBe('/x?');
  });

  it('does not throw on malformed percent-encoding', () => {
    expect(() => redactUrl('/x?%ZZ=1&token=secret')).not.toThrow();
    expect(redactUrl('/x?%ZZ=1&token=secret')).toContain('[REDACTED]');
  });

  it('does not redact a parameter that merely contains a sensitive word', () => {
    // `tokenCount` is not a credential; over-redacting hurts debuggability.
    expect(redactUrl('/x?tokenCount=5')).toBe('/x?tokenCount=5');
  });
});
