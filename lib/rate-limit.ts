import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (key: string -> record)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys periodically to avoid memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Extract client IP from Request headers
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check rate limit for a request.
 * Returns null if request is allowed, or a NextResponse (429) if rate limited.
 */
export function checkRateLimit(
  req: Request,
  routeKey: string,
  config: RateLimitConfig
): NextResponse | null {
  const ip = getClientIp(req);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New or expired window
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return null;
  }

  if (record.count >= config.limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please slow down.",
        retryAfterSeconds: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(record.resetTime / 1000)),
        },
      }
    );
  }

  record.count += 1;
  return null;
}
