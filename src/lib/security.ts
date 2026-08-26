import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

// Process-local fallback only. Resets on cold start and does NOT coordinate
// across concurrent serverless instances -- it exists solely so the app keeps
// building and running (local dev, zero-env-var builds) when Upstash Redis
// isn't configured. Production traffic must have UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN set; see ADR-CIQ-002.
const memoryFallbackBuckets = new Map<string, { count: number; resetAt: number }>();

const limiters = new Map<string, Ratelimit>();
let warnedNoRedis = false;

function getRedisLimiter(max: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      analytics: false,
      prefix: 'cargoiq:ratelimit',
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

function consumeMemoryFallback(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = memoryFallbackBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryFallbackBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

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

/**
 * Durable, serverless-safe rate limiting via Upstash Redis (ADR-CIQ-002).
 * Falls back to a process-local bucket only when Upstash env vars are absent,
 * so builds/dev keep working -- that fallback provides no real protection
 * across multiple instances and a warning is logged once per process.
 */
export async function consumeRateLimit(key: string, max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS): Promise<boolean> {
  const limiter = getRedisLimiter(max, windowMs);

  if (!limiter) {
    if (!warnedNoRedis) {
      warnedNoRedis = true;
      console.warn('[Security] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not configured; rate limiting is running on a process-local fallback that does not coordinate across serverless instances. Configure Upstash Redis before relying on this in production.');
    }
    return consumeMemoryFallback(key, max, windowMs);
  }

  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    console.error('[Security] Rate limiter Redis call failed; failing open for this request.', err);
    return true;
  }
}
