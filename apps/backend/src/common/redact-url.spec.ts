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

  // Bypasses found during review. None occur on our own routes, but a
  // redaction helper is only worth having if it cannot be sidestepped.
  describe('evasion', () => {
    it('redacts a percent-encoded parameter name', () => {
      expect(redactUrl('/x?%74oken=secret')).toBe('/x?%74oken=[REDACTED]');
      expect(redactUrl('/x?%54OKEN=secret')).toBe('/x?%54OKEN=[REDACTED]');
    });

    it('redacts an array-suffixed parameter', () => {
      expect(redactUrl('/x?token[]=secret')).toBe('/x?token[]=[REDACTED]');
    });

    it('redacts around a leading + or whitespace', () => {
      expect(redactUrl('/x?+token=secret')).toBe('/x?+token=[REDACTED]');
      expect(redactUrl('/x? token=secret')).toBe('/x? token=[REDACTED]');
    });

    it('redacts inside a fragment', () => {
      // Implicit-flow style callbacks put credentials after the '#'.
      expect(redactUrl('/x?a=1#token=secret')).toBe('/x?a=1#token=[REDACTED]');
    });

    it('keeps a fragment that carries no credential', () => {
      expect(redactUrl('/x?token=secret#frag')).toBe('/x?token=[REDACTED]#frag');
    });

    it('redacts every occurrence of a repeated parameter', () => {
      expect(redactUrl('/x?token=a&token=b')).toBe('/x?token=[REDACTED]&token=[REDACTED]');
    });
  });
});
