// Lightweight, dependency-free in-memory rate limiter

export function createRateLimiter({
  windowMs = 60 * 1000, // 1 minute default
  max = 60,             // 60 requests per window
  message = 'Too many requests. Please slow down.'
} = {}) {
  const hits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const ip = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '127.0.0.1';
    const now = Date.now();

    const timestamps = (hits.get(ip) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= max) {
      const retryAfter = Math.ceil((windowMs - (now - timestamps[0])) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfter));
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: Math.max(1, retryAfter)
      });
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

// Pre-configured rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20,                  // 20 attempts per 15 mins
  message: 'Too many authentication attempts. Please try again later.'
});

export const orderLimiter = createRateLimiter({
  windowMs: 60 * 1000,      // 1 minute
  max: 10,                  // 10 orders per minute per IP
  message: 'Order creation rate limit reached. Please wait a moment before trying again.'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 30,                  // 30 uploads per 5 mins
  message: 'Upload rate limit reached. Please wait a moment before trying again.'
});

export const contactLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,                  // 10 enquiries per 10 mins
  message: 'Too many messages sent. Please wait before submitting another enquiry.'
});
