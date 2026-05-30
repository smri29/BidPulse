/**
 * Module: backend/middleware/rateLimitMiddleware.js
 * Purpose: Defines Express middleware that enforces shared request handling rules.
 */
const buckets = new Map();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupAt = 0;

// Simple in-memory rate limiting is enough for low-scale abuse protection on sensitive endpoints.
const cleanupExpiredBuckets = (now) => {
  // Opportunistic cleanup keeps the in-memory limiter bounded without a dedicated timer.
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS && buckets.size < 1500) return;
  lastCleanupAt = now;

  for (const [key, value] of buckets.entries()) {
    if (now > value.expiresAt) {
      buckets.delete(key);
    }
  }
};

const createRateLimiter = ({ windowMs = 60 * 1000, max = 30, keyPrefix = 'global' } = {}) => {
  return (req, res, next) => {
    // IP-based limiter is simple but effective for auth, OTP, and support endpoints.
    const ip = req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const existing = buckets.get(key);
    if (!existing || now > existing.expiresAt) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        message: 'Too many requests. Please try again shortly.',
      });
    }

    existing.count += 1;
    buckets.set(key, existing);
    return next();
  };
};

module.exports = { createRateLimiter };
