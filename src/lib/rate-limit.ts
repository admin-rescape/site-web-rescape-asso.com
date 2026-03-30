/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Resets automatically when the server-side process restarts.
 * For production at scale, replace with Redis + @upstash/ratelimit.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
    /** Maximum requests allowed within the window */
    limit: number;
    /** Window size in seconds */
    windowSec: number;
}

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * Key is typically `ip:route`.
 */
export function rateLimit(key: string, { limit, windowSec }: RateLimitOptions): boolean {
    const now = Date.now();
    const windowMs = windowSec * 1000;

    const record = store.get(key);

    if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count += 1;
    return true;
}

/**
 * Extract client IP from a Next.js request.
 */
export function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return "unknown";
}
