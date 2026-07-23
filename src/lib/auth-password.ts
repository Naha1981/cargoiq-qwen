// DEPRECATED — replaced by Clerk. Do not use.
import crypto from 'crypto';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derived);
  } catch {
    return false;
  }
}
