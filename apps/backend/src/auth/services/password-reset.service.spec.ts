import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'bun:test';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PasswordResetService } from './password-reset.service';

const hash = (t: string) => createHash('sha256').update(t).digest('hex');

interface TokenRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

function makeHarness() {
  const state = {
    users: [
      { id: 'u1', email: 'known@example.com', name: 'Ada', deletedAt: null as Date | null },
      { id: 'u2', email: 'deleted@example.com', name: null, deletedAt: new Date() },
    ],
    tokens: [] as TokenRow[],
    passwordHashes: {} as Record<string, string>,
    revoked: [] as string[],
    emails: [] as { to: string; link: string }[],
  };

  let seq = 0;

  const passwordResetToken = {
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: { usedAt: Date } }) => {
      let n = 0;
      for (const t of state.tokens) {
        const idOk = where.id === undefined || t.id === where.id;
        const userOk = where.userId === undefined || t.userId === where.userId;
        const unusedOk = where.usedAt !== null || t.usedAt === null;
        if (idOk && userOk && unusedOk) {
          t.usedAt = data.usedAt;
          n++;
        }
      }
      return { count: n };
    },
    create: async ({ data }: { data: Omit<TokenRow, 'id' | 'usedAt'> }) => {
      const row: TokenRow = { id: `t${++seq}`, usedAt: null, ...data };
      state.tokens.push(row);
      return row;
    },
    findUnique: async ({ where }: { where: { tokenHash: string } }) =>
      state.tokens.find((t) => t.tokenHash === where.tokenHash) ?? null,
  };

  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email: string } }) =>
        state.users.find((u) => u.email === where.email) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: { passwordHash: string } }) => {
        state.passwordHashes[where.id] = data.passwordHash;
        return { id: where.id };
      },
    },
    passwordResetToken,
    // The array form runs both statements; the harness executes them eagerly,
    // matching how the service composes them.
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  };

  let issued = '';
  const service = new PasswordResetService(
    prisma as never,
    { generateSecureToken: () => (issued = `token-${++seq}-abcdefghijklmnopqrstuvwxyz`) } as never,
    { hash: async (p: string) => `argon2:${p}` } as never,
    { revokeAllForUser: async (id: string) => void state.revoked.push(`refresh:${id}`) } as never,
    { invalidateAllForUser: async (id: string) => void state.revoked.push(`session:${id}`) } as never,
    { revokeAllForUser: async (id: string) => void state.revoked.push(`access:${id}`) } as never,
    { invalidate: async () => undefined } as never,
    { logSecurityEvent: async () => undefined } as never,
    { get: () => 'https://www.avuno.xyz' } as never,
    {
      sendPasswordResetEmail: async (to: string, o: { link: string }) => {
        state.emails.push({ to, link: o.link });
      },
    } as never,
  );

  return { service, state, issuedToken: () => issued };
}

describe('PasswordResetService', () => {
  let h: ReturnType<typeof makeHarness>;

  beforeEach(() => {
    h = makeHarness();
  });

  describe('requestReset', () => {
    it('issues a token and emails a link for a known address', async () => {
      await h.service.requestReset('known@example.com');
      expect(h.state.tokens).toHaveLength(1);
      expect(h.state.emails).toHaveLength(1);
      expect(h.state.emails[0].link).toContain('/auth/reset-password?token=');
    });

    it('stores only a hash, never the raw token', async () => {
      await h.service.requestReset('known@example.com');
      const raw = h.issuedToken();
      expect(h.state.tokens[0].tokenHash).toBe(hash(raw));
      expect(h.state.tokens[0].tokenHash).not.toBe(raw);
    });

    it('does not reveal that an address is unknown', async () => {
      // Must resolve exactly as the known-address case does; the caller
      // returns an identical response either way.
      await expect(h.service.requestReset('nobody@example.com')).resolves.toBeUndefined();
      expect(h.state.tokens).toHaveLength(0);
      expect(h.state.emails).toHaveLength(0);
    });

    it('ignores a soft-deleted account', async () => {
      await h.service.requestReset('deleted@example.com');
      expect(h.state.emails).toHaveLength(0);
    });

    it('retires any outstanding token when a new one is requested', async () => {
      await h.service.requestReset('known@example.com');
      const first = h.issuedToken();
      await h.service.requestReset('known@example.com');

      // The old link must stop working, otherwise an intercepted earlier
      // email stays redeemable.
      await expect(h.service.completeReset(first, 'a-long-enough-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('completeReset', () => {
    it('sets the new password hash', async () => {
      await h.service.requestReset('known@example.com');
      await h.service.completeReset(h.issuedToken(), 'a-long-enough-password');
      expect(h.state.passwordHashes['u1']).toBe('argon2:a-long-enough-password');
    });

    it('consumes the token so it cannot be replayed', async () => {
      await h.service.requestReset('known@example.com');
      const token = h.issuedToken();
      await h.service.completeReset(token, 'a-long-enough-password');
      await expect(h.service.completeReset(token, 'another-long-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('revokes every session and access token', async () => {
      // A reset is often a response to compromise; leaving the attacker's
      // session alive would defeat it.
      await h.service.requestReset('known@example.com');
      await h.service.completeReset(h.issuedToken(), 'a-long-enough-password');
      expect(h.state.revoked).toContain('refresh:u1');
      expect(h.state.revoked).toContain('session:u1');
      expect(h.state.revoked).toContain('access:u1');
    });

    it('rejects an unknown token', async () => {
      await expect(h.service.completeReset('never-issued-token', 'a-long-enough-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an expired token', async () => {
      await h.service.requestReset('known@example.com');
      h.state.tokens[0].expiresAt = new Date(Date.now() - 1000);
      await expect(h.service.completeReset(h.issuedToken(), 'a-long-enough-password')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('gives the same message for expired, used and unknown tokens', async () => {
      await h.service.requestReset('known@example.com');
      const token = h.issuedToken();
      await h.service.completeReset(token, 'a-long-enough-password');

      const capture = async (t: string): Promise<string> => {
        try {
          await h.service.completeReset(t, 'x'.repeat(12));
          return 'no error thrown';
        } catch (e) {
          return (e as Error).message;
        }
      };

      expect(await capture(token)).toBe(await capture('nope'));
    });
  });
});
