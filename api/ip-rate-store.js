// ip-rate-store.js
const { connectToDatabase } = require('./mongodb');

const COLLECTION_NAME = 'rateLimits';

// Initialize the rateLimits collection index
async function initializeRateLimitsCollection() {
  try {
    const { db } = await connectToDatabase();
    await db.collection(COLLECTION_NAME).createIndex({ ip: 1 }, { unique: true });
    console.log('Created unique index on ip field for rateLimits collection');
  } catch (error) {
    console.error('Error creating index for rateLimits collection:', error);
  }
}

// Run initialization once when module is loaded
initializeRateLimitsCollection().catch((error) => {
  console.error('Failed to initialize rateLimits collection:', error);
});

/**
 * Get rate limiting info for an IP address from MongoDB
 * @param {string} ip - The IP address
 * @param {Object} options - Rate limiting options
 * @returns {Object} - The rate limiting data for this IP
 */
async function getRateInfo(ip, options) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const maxRequests = options.maxRequests || 30;
  const windowMs = options.windowMs || 3600000; // 1 hour default
  const now = Date.now();

  // Find the rate limit document for this IP
  let rateInfo = await collection.findOne({ ip });

  if (!rateInfo) {
    // Create a new entry if none exists
    rateInfo = {
      ip,
      count: 0,
      resetTime: now + windowMs,
      firstSeen: now,
      lastMessageTime: now,
      messageTimestamps: [now],
    };
  } else {
    // Check if the window has expired
    if (now > rateInfo.resetTime) {
      rateInfo.count = 0;
      rateInfo.resetTime = now + windowMs;
    }
  }

  // Calculate if the request is allowed
  const isAllowed = rateInfo.count < maxRequests;

  // Only increment if the request is allowed
  if (isAllowed) {
    rateInfo.count += 1;
    rateInfo.lastMessageTime = now;
    rateInfo.messageTimestamps.push(now);
    if (rateInfo.messageTimestamps.length > 10) {
      rateInfo.messageTimestamps.shift(); // Keep only the last 10 timestamps
    }
  }

  // Save the updated rate info back to MongoDB
  await collection.updateOne(
    { ip },
    { $set: rateInfo },
    { upsert: true }
  );

  return {
    ip,
    currentCount: rateInfo.count,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - rateInfo.count),
    resetTime: rateInfo.resetTime,
    isAllowed,
  };
}

/**
 * Get the current status of all rate limiting (for debugging/monitoring)
 * @returns {Array} - List of rate limit documents
 */
async function getStatus() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  return collection.find({}).toArray();
}

/**
 * Clean all rate limit data - reset everything
 */
async function cleanAllRateLimitData() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  await collection.deleteMany({});
  console.log('🧹 All rate limit data reset');
}

module.exports = {
  getRateInfo,
  getStatus,
  cleanAllRateLimitData,
};
