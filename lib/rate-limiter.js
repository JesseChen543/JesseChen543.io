// rate-limiter.js
import * as rateStore from './ip-rate-store.js';

// Default limits
const DEFAULT_MAX_REQUESTS = 2;      // Maximum requests per window
const DEFAULT_WINDOW_MS = 3600000;    // 1 hour (in milliseconds)

/**
 * Check if a request from the given IP is allowed based on rate limits
 * @param {string} ip - The IP address of the requester
 * @param {Object} options - Configuration options
 * @param {number} options.maxRequests - Maximum requests allowed per window (default: 2)
 * @param {number} options.windowMs - Time window in milliseconds (default: 1 hour)
 * @returns {Object} - Status object { allowed: boolean, remaining: number, resetTime: timestamp }
 */
async function checkRateLimit(ip, options = {}) {
  console.log('\n----- RATE LIMITER DEBUG -----');
  console.log(`Checking rate limit for IP: ${ip}`);

  // Get rate info from the MongoDB store
  const rateInfo = await rateStore.getRateInfo(ip, {
    maxRequests: options.maxRequests || DEFAULT_MAX_REQUESTS,
    windowMs: options.windowMs || DEFAULT_WINDOW_MS,
  });

  console.log(`Rate info for ${rateInfo.ip}:`);
  console.log(`- Current count: ${rateInfo.currentCount}`);
  console.log(`- Limit: ${rateInfo.limit}`);
  console.log(`- Remaining: ${rateInfo.remaining}`);
  console.log(`- Reset time: ${new Date(rateInfo.resetTime).toLocaleTimeString()}`);
  console.log(`- Allowed: ${rateInfo.isAllowed}`);
  console.log('----- END DEBUG -----\n');

  return {
    allowed: rateInfo.isAllowed,
    remaining: rateInfo.remaining,
    resetTime: rateInfo.resetTime,
    currentCount: rateInfo.currentCount,
  };
}

/**
 * Middleware function to handle rate limiting
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - Configuration options
 * @returns {boolean} - True if request is allowed, false if rate limited (response is already sent)
 */
async function rateLimiter(req, res, options = {}) {
  // Get IP address from request
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (forwardedFor ? forwardedFor.split(',')[0] : null) || req.socket.remoteAddress || 'unknown';

  console.log('\n==== RATE LIMITING REQUEST ====');
  console.log('Raw IP data:');
  console.log(`- x-forwarded-for: ${req.headers['x-forwarded-for'] || 'not set'}`);
  console.log(`- remoteAddress: ${req.socket.remoteAddress || 'not set'}`);
  console.log(`- Using IP: ${ip}`);

  try {
    // Get rate info for this IP
    const rateInfo = await rateStore.getRateInfo(ip, options);

    // If not allowed, send 429 Too Many Requests
    if (!rateInfo.isAllowed) {
      const resetInSeconds = Math.ceil((rateInfo.resetTime - Date.now()) / 1000);

      res.setHeader('X-RateLimit-Limit', rateInfo.limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateInfo.resetTime / 1000));
      res.setHeader('Retry-After', resetInSeconds);

      console.log(`❌ RATE LIMITED: IP ${ip} - Request count: ${rateInfo.currentCount}/${rateInfo.limit} - Limit exceeded`);
      res.status(429).json({
        error: 'Rate limit exceeded. It seems like you\'re interested in Jesse. Feel free to contact him directly at contact@jessechen.io or visit the contact page.',
        friendlyMessage: 'It seems like you\'re interested in learning more about Jesse. Feel free to contact him directly!',
        retryAfter: resetInSeconds,
        currentCount: rateInfo.currentCount,
        maxRequests: rateInfo.limit,
      });

      return false;
    }

    // Set informational headers about rate limits
    res.setHeader('X-RateLimit-Limit', rateInfo.limit);
    res.setHeader('X-RateLimit-Remaining', rateInfo.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateInfo.resetTime / 1000));

    console.log(`✅ ALLOWED: IP ${ip} - Request count: ${rateInfo.currentCount}/${rateInfo.limit}`);
    console.log('==== END RATE LIMITING ====\n');
    return true;
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return false;
  }
}

/**
 * Get current status for all IPs (for debugging/monitoring)
 * @returns {Object} The current state of the rate limiter
 */
async function getRateLimitStatus() {
  return rateStore.getStatus();
}

export {
  rateLimiter,
  checkRateLimit,
  getRateLimitStatus
};
