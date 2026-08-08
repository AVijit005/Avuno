import { describe, it, expect } from 'bun:test';
import * as crypto from 'crypto';
import { PasswordService } from './password.service';

/** Reproduces the previous scrypt format so migration can be tested. */
function legacyScryptHash(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(plain, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

describe('PasswordService', () => {
  const service = new PasswordService();

  describe('argon2id hashing', () => {
    it('hashes a password with argon2id', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');
      expect(hash).toContain('$argon2id$');
    });

    it('uses the OWASP baseline parameters', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');
      expect(hash).toContain('m=19456');
      expect(hash).toContain('t=2');
      expect(hash).toContain('p=1');
    });

    it('salts each hash, so identical passwords differ', async () => {
      const a = await service.hash('StrongP@ssw0rd123');
      const b = await service.hash('StrongP@ssw0rd123');
      expect(a).not.toBe(b);
    });

    it('returns true for a matching password', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');
      expect(await service.compare('StrongP@ssw0rd123', hash)).toBe(true);
    });

    it('returns false for a non-matching password', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');
      expect(await service.compare('WrongPassword!', hash)).toBe(false);
    });
  });

  describe('legacy scrypt compatibility', () => {
    it('still verifies existing scrypt hashes', async () => {
      // Users created before the argon2 switch must be able to log in.
      const legacy = await legacyScryptHash('StrongP@ssw0rd123');
      expect(await service.compare('StrongP@ssw0rd123', legacy)).toBe(true);
    });

    it('rejects a wrong password against a scrypt hash', async () => {
      const legacy = await legacyScryptHash('StrongP@ssw0rd123');
      expect(await service.compare('WrongPassword!', legacy)).toBe(false);
    });

    it('flags scrypt hashes for upgrade', async () => {
      const legacy = await legacyScryptHash('StrongP@ssw0rd123');
      expect(service.needsRehash(legacy)).toBe(true);
    });

    it('does not flag a current argon2id hash', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');
      expect(service.needsRehash(hash)).toBe(false);
    });
  });

  describe('malformed input', () => {
    it('returns false rather than throwing on a corrupt argon2 hash', async () => {
      expect(await service.compare('x', '$argon2id$garbage')).toBe(false);
    });

    it('returns false on a malformed legacy hash', async () => {
      expect(await service.compare('x', 'no-colon-here')).toBe(false);
      expect(await service.compare('x', 'a:b:c')).toBe(false);
    });

    it('returns false on an empty stored hash', async () => {
      expect(await service.compare('x', '')).toBe(false);
    });
  });

  describe('timing equalisation', () => {
    it('dummyCompare costs roughly as much as a real verification', async () => {
      const hash = await service.hash('StrongP@ssw0rd123');

      const realStart = performance.now();
      await service.compare('WrongPassword!', hash);
      const realMs = performance.now() - realStart;

      const dummyStart = performance.now();
      await service.dummyCompare();
      const dummyMs = performance.now() - dummyStart;

      // Same order of magnitude is what defeats the enumeration oracle;
      // exact parity is neither achievable nor required.
      expect(dummyMs).toBeGreaterThan(realMs * 0.25);
      expect(dummyMs).toBeLessThan(realMs * 4);
    });
  });
});
