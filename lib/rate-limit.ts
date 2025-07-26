// Simple in-memory rate limiter
// For production, replace with a distributed store like Redis

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

export const rateLimit = (ip: string) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Clean up old entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < windowStart) {
      delete store[key];
    }
  });

  // Initialize or get the rate limit entry for this IP
  if (!store[ip]) {
    store[ip] = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  // Increment the request count
  store[ip].count += 1;

  // Check if rate limit is exceeded
  if (store[ip].count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      isAllowed: false,
      remaining: 0,
      resetAt: store[ip].resetAt,
    };
  }

  return {
    isAllowed: true,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - store[ip].count),
    resetAt: store[ip].resetAt,
  };
};
