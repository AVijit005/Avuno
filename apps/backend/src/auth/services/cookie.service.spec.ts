import { describe, it, expect, beforeEach } from 'bun:test';
import { CookieService, REFRESH_TOKEN_COOKIE } from './cookie.service';

function createMockResponse() {
  return {
    cookies: {} as Record<string, unknown>,
    cleared: [] as string[],
    cookie(name: string, value: string, options: unknown) {
      this.cookies[name] = { value, options };
    },
    clearCookie(name: string, options: unknown) {
      this.cleared.push(name);
      this.cookies[name] = { value: undefined, options };
    },
  };
}

function createMockRequest(cookies?: Record<string, string>) {
  return { cookies } as unknown as import('express').Request;
}

describe('CookieService', () => {
  let service: CookieService;

  beforeEach(() => {
    service = new CookieService({
      get: (key: string) => {
        if (key === 'nodeEnv') return 'development';
        if (key === 'cookie.domain') return '';
        return undefined;
      },
    } as unknown as import('@nestjs/config').ConfigService);
  });

  it('writes an http-only refresh token cookie', () => {
    const res = createMockResponse();
    service.writeRefreshToken(res as unknown as import('express').Response, 'token123', 604800);
    expect(res.cookies[REFRESH_TOKEN_COOKIE]).toBeDefined();
    expect((res.cookies[REFRESH_TOKEN_COOKIE] as { options: { httpOnly: boolean } }).options.httpOnly).toBe(true);
    expect((res.cookies[REFRESH_TOKEN_COOKIE] as { options: { secure: boolean } }).options.secure).toBe(true);
    expect((res.cookies[REFRESH_TOKEN_COOKIE] as { options: { sameSite: string } }).options.sameSite).toBe('none');
    expect((res.cookies[REFRESH_TOKEN_COOKIE] as { options: { path: string } }).options.path).toBe('/api/auth');
  });

  it('reads refresh token from request cookies', () => {
    const req = createMockRequest({ [REFRESH_TOKEN_COOKIE]: 'token123' });
    expect(service.readRefreshToken(req)).toBe('token123');
  });

  it('clears refresh token cookie', () => {
    const res = createMockResponse();
    service.clearRefreshToken(res as unknown as import('express').Response);
    expect(res.cleared).toContain(REFRESH_TOKEN_COOKIE);
  });
});
