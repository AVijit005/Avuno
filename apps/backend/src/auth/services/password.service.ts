import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

/**
 * OWASP Password Storage Cheat Sheet, argon2id baseline:
 * 19 MiB memory, 2 iterations, 1 degree of parallelism.
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/** Legacy format produced by the previous implementation: "<salt>:<hex key>". */
const LEGACY_SCRYPT_KEYLEN = 64;

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  /**
   * Hash a password with argon2id.
   *
   * Replaces scrypt at Node's defaults (N=16384, r=8, p=1), which is roughly
   * an eighth of the OWASP minimum and materially cheaper to attack with GPUs
   * or ASICs. argon2 was already a declared dependency and simply unused.
   */
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, ARGON2_OPTIONS);
  }

  /**
   * Verify a password against either format.
   *
   * Existing users still have scrypt hashes, so those must keep working;
   * needsRehash() tells the caller when to upgrade the stored value.
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    if (!hashed) return false;

    if (hashed.startsWith('$argon2')) {
      try {
        return await argon2.verify(hashed, plain);
      } catch (error) {
        // A malformed stored hash must read as "wrong password", never as an
        // unhandled error that could leak detail to the caller.
        this.logger.warn('argon2 verification failed for a stored hash', error as Error);
        return false;
      }
    }

    return this.compareLegacyScrypt(plain, hashed);
  }

  /**
   * Perform a throwaway verification so an unknown email costs roughly the
   * same as a known one.
   *
   * Without this, login returns in ~1ms when no user matches versus ~40ms when
   * one does, which reliably enumerates registered addresses regardless of how
   * uniform the error messages are.
   */
  async dummyCompare(): Promise<void> {
    try {
      await argon2.verify(PasswordService.DUMMY_HASH, 'invalid-password-placeholder');
    } catch {
      // Expected to be false/throw; the point is the elapsed work.
    }
  }

  /**
   * A fixed argon2id hash using the same parameters as hash(), so
   * dummyCompare() does equivalent work. Not a secret: it is a hash of a
   * throwaway value and is never accepted as a credential.
   */
  private static readonly DUMMY_HASH =
    '$argon2id$v=19$m=19456,t=2,p=1$hWeS3laBz4002q7FSJHiMg$pVpdzazSAnSmWcYETvMpcuQ458DpNkrH7QVupUf/5Yo';

  /**
   * True when a stored hash should be re-hashed after a successful login,
   * i.e. it is legacy scrypt or was produced with weaker argon2 parameters.
   */
  needsRehash(hashed: string): boolean {
    if (!hashed) return false;
    if (!hashed.startsWith('$argon2')) return true;
    try {
      return argon2.needsRehash(hashed, ARGON2_OPTIONS);
    } catch {
      return true;
    }
  }

  private compareLegacyScrypt(plain: string, hashed: string): Promise<boolean> {
    const parts = hashed.split(':');
    if (parts.length !== 2) return Promise.resolve(false);
    const [salt, key] = parts;

    return new Promise((resolve) => {
      crypto.scrypt(plain, salt, LEGACY_SCRYPT_KEYLEN, (err, derivedKey) => {
        // The previous implementation called reject(err) without returning,
        // so on error it went on to dereference an undefined derivedKey and
        // threw inside the executor after already rejecting. Resolve false.
        if (err) {
          resolve(false);
          return;
        }
        try {
          const keyBuffer = Buffer.from(key, 'hex');
          resolve(keyBuffer.length === derivedKey.length && crypto.timingSafeEqual(keyBuffer, derivedKey));
        } catch {
          resolve(false);
        }
      });
    });
  }
}
