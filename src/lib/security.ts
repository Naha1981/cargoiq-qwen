import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function getRequestIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (forwarded) {
    return forwarded.split(',')[0].trim() || 'unknown';
  }
  return 'unknown';
}

export function verifyWebhookSecret(req: NextRequest): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Security] WEBHOOK_SECRET is not configured; webhook secret check is bypassed. Inbound Evolution webhooks are allowed through until it is set.');
    }
    return true;
  }

  const presented =
    req.headers.get('x-webhook-secret') ||
    req.headers.get('x-webhook-token') ||
    req.headers.get('x-api-key') ||
    req.headers.get('apikey') ||
    req.headers.get('x-signature') ||
    '';

  if (!presented) {
    return false;
  }

  return safeCompare(presented, webhookSecret);
}

export function consumeRateLimit(key: string, max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count += 1;
  return true;
}
