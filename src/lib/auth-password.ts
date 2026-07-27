// DEPRECATED — replaced by Clerk. Do not use.
// Password hashing removed — Clerk handles authentication now.
export function hashPassword(_pw: string): string { throw new Error('Deprecated'); }
export function verifyPassword(_pw: string, _hash: string): boolean { return false; }
