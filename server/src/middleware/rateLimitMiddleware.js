// Generic per-IP rate limiters.
// Uses express-rate-limit: https://github.com/express-rate-limit/express-rate-limit
// A limiter is just an Express middleware that counts requests per window
// and short-circuits with 429 when the count exceeds the limit.
const rateLimit = require('express-rate-limit');

// Applied to ALL /api routes — generous, just to stop abuse.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // 300 requests per IP per window
  standardHeaders: true,    // Return RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Stricter limiter for auth endpoints specifically.
// Login + register are CPU-heavy (bcrypt) and are the prime brute-force target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 login/register attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests against the limit, so successful logins don't lock out legit users
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many login attempts. Please wait 15 minutes and try again.',
  },
});

module.exports = { globalLimiter, authLimiter };