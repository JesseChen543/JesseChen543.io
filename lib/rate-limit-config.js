/**
 * Centralized Rate Limit Configuration
 * Update the MAX_REQUESTS_PER_DAY value here to apply globally across all API endpoints
 */

// Maximum requests allowed per IP per day
export const MAX_REQUESTS_PER_DAY = 200;

// Rate limit window in milliseconds (24 hours)
export const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

// Default rate limit options
export const DEFAULT_RATE_LIMIT_OPTIONS = {
  maxRequests: MAX_REQUESTS_PER_DAY,
  windowMs: RATE_LIMIT_WINDOW_MS
};
