import { NextResponse } from 'next/server';

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

// Periodic memory cleanup every 10 minutes with unref to prevent hanging test runners
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, tracker] of rateLimitMap.entries()) {
    if (now > tracker.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 15 * 60 * 1000 // 15-minute default window
): { allowed: boolean; remaining: number; resetTime: number; response?: NextResponse } {
  const now = Date.now();
  const tracker = rateLimitMap.get(ip);

  if (!tracker || now > tracker.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (tracker.count >= limit) {
    const retryAfterSeconds = Math.ceil((tracker.resetAt - now) / 1000);
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Submission limit exceeded. Please try again in ${retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
    return { allowed: false, remaining: 0, resetTime: tracker.resetAt, response };
  }

  tracker.count += 1;
  return { allowed: true, remaining: limit - tracker.count, resetTime: tracker.resetAt };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
