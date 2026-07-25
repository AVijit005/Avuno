import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.scrypt(plain, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const parts = hashed.split(':');
      if (parts.length !== 2) return resolve(false);
      const [salt, key] = parts;
      crypto.scrypt(plain, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }
}
