import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = {
      getHandler: mock(),
      getClass: mock(),
      switchToHttp: mock(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user has no role but roles are required', () => {
    spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = {
      getHandler: mock(),
      getClass: mock(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: '123', email: 'test@test.com' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user role does not match required roles', () => {
    spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = {
      getHandler: mock(),
      getClass: mock(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: '123', email: 'test@test.com', role: UserRole.USER } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return true if user role matches required roles', () => {
    spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = {
      getHandler: mock(),
      getClass: mock(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: '123', email: 'test@test.com', role: UserRole.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
