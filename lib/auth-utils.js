// JWT Authentication utilities
import jwt from 'jsonwebtoken';

// Secret key for JWT signing - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Environment variable JWT_SECRET is required but not defined.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Default 24 hours

/**
 * Generate a JWT token for admin authentication
 * @param {Object} payload - Data to include in the token
 * @returns {String} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {String|null} Extracted token or null
 */
function extractTokenFromRequest(req) {
  // Check authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Check query parameters
  if (req.query && req.query.token) {
    return req.query.token;
  }

  // Check cookies if available
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }

  return null;
}

export {
  generateToken,
  verifyToken,
  extractTokenFromRequest
};
