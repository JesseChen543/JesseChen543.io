// Persistent IP rate limiting storage for Vercel serverless functions
// Uses a combination of global variables and filesystem access for persistence
// This works in both development and production environments

const fs = require('fs');
const path = require('path');

// File path for persisting data in development environment - use visible filename
const DATA_FILE = path.join(process.cwd(), 'rate-limit-data.json'); // No dot prefix makes it visible

// How often to save data to disk (ms)
const SAVE_INTERVAL = 5000; // 5 seconds

// Use a global variable to store rate limiting data in memory
// This works well for development with hot reloading
global._rateLimit = global._rateLimit || {
  ipStore: {},
  lastSave: Date.now(),
  requestCount: 0
};

/**
 * Load rate limiting data from disk if available
 */
function loadDataFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      
      // Debug what we loaded from disk
      console.log(`📂 Loading rate data from disk:`, DATA_FILE);
      
      if (data && data.ipStore) {
        // Store the loaded data
        global._rateLimit.ipStore = data.ipStore || {};
        
        console.log(`Found ${Object.keys(global._rateLimit.ipStore).length} IPs in file:`);
        Object.keys(global._rateLimit.ipStore).forEach(ip => {
          const entry = global._rateLimit.ipStore[ip];
          console.log(`- IP: ${ip}, Count: ${entry.count}, Reset: ${new Date(entry.resetTime).toLocaleTimeString()}`);
        });
        
        // Clean expired entries
        const now = Date.now();
        let expired = 0;
        
        Object.keys(global._rateLimit.ipStore).forEach(ip => {
          if (now > global._rateLimit.ipStore[ip].resetTime) {
            console.log(`🧹 Cleaning expired entry for ${ip}`);
            delete global._rateLimit.ipStore[ip];
            expired++;
          }
        });
        
        if (expired > 0) {
          console.log(`🧹 Cleaned ${expired} expired entries`);
        }
      } else {
        console.log(`⚠️ No valid IP store found in data file`);
      }
    } else {
      console.log(`⚠️ Data file not found: ${DATA_FILE}`);
    }
  } catch (error) {
    console.error('Error loading rate limit data:', error);
    global._rateLimit.ipStore = {};
  }
}

/**
 * Save rate limiting data to disk
 */
function saveDataToDisk() {
  try {
    // Create a deep copy of the data to avoid reference issues
    const ipStoreCopy = {};
    
    // Copy each IP entry explicitly to ensure proper serialization
    for (const ip in global._rateLimit.ipStore) {
      ipStoreCopy[ip] = {
        count: global._rateLimit.ipStore[ip].count,
        resetTime: global._rateLimit.ipStore[ip].resetTime,
        firstSeen: global._rateLimit.ipStore[ip].firstSeen || Date.now()
      };
    }
    
    const data = {
      ipStore: ipStoreCopy,
      savedAt: Date.now()
    };
    
    // Debug the data being saved
    console.log(`Saving rate data with ${Object.keys(ipStoreCopy).length} IPs`);
    Object.keys(ipStoreCopy).forEach(ip => {
      console.log(`- IP: ${ip}, Count: ${ipStoreCopy[ip].count}, Reset: ${new Date(ipStoreCopy[ip].resetTime).toLocaleTimeString()}`);
    });
    
    // Write to disk
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    global._rateLimit.lastSave = Date.now();
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Get rate limiting info for an IP address
 * @param {string} ip - The IP address
 * @param {Object} options - Rate limiting options
 * @returns {Object} - The rate limiting data for this IP
 */
function getRateInfo(ip, options) {
  global._rateLimit.requestCount++;
  
  // Ensure data is loaded every time to prevent race conditions
  loadDataFromDisk();
  
  const maxRequests = options.maxRequests || 30;
  const windowMs = options.windowMs || 3600000; // 1 hour default
  const now = Date.now();
  
  // Normalize the IP and add debug info
  const normalizedIp = String(ip).trim();
  console.log(`\n🔍 RATE CHECK: IP "${normalizedIp}" (request #${global._rateLimit.requestCount})`);
  console.log(`Current IP store keys: ${Object.keys(global._rateLimit.ipStore).join(', ') || 'none'}`);
  
  // Initialize or get existing data for this IP
  if (!global._rateLimit.ipStore[normalizedIp]) {
    console.log(`👉 Creating new entry for IP: ${normalizedIp}`);
    global._rateLimit.ipStore[normalizedIp] = {
      count: 0, // Will be incremented below
      resetTime: now + windowMs,
      firstSeen: now
    };
  } else {
    console.log(`👉 Found existing entry for IP: ${normalizedIp}, current count: ${global._rateLimit.ipStore[normalizedIp].count}`);
  }
  
  const ipData = global._rateLimit.ipStore[normalizedIp];
  
  // Check if the window has expired and reset if needed
  if (now > ipData.resetTime) {
    console.log(`🔄 Reset rate limit for IP ${normalizedIp} (window expired)`);
    ipData.count = 0;
    ipData.resetTime = now + windowMs;
  }
  
  // Calculate allowed status BEFORE incrementing the counter
  const isAllowed = ipData.count < maxRequests;
  console.log(`🔎 Checking if allowed: ${ipData.count} < ${maxRequests} = ${isAllowed}`);
  
  // Only increment if the request is allowed
  if (isAllowed) {
    ipData.count++;
    console.log(`➕ Incremented count for IP ${normalizedIp} to ${ipData.count}/${maxRequests}`);
  } else {
    console.log(`❌ Not incrementing count - limit already reached: ${ipData.count}/${maxRequests}`);
  }
  
  // Save data immediately after updating
  saveDataToDisk();
  console.log(`💾 Saved rate limit data to disk`);
  
  // Return rate limit info
  return {
    ip: normalizedIp,
    currentCount: ipData.count,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - ipData.count),
    resetTime: ipData.resetTime,
    isAllowed: isAllowed // Use the pre-calculated value based on count before increment
  };
}

/**
 * Get the current status of all rate limiting
 * @returns {Object} Status object
 */
function getStatus() {
  return {
    ipCount: Object.keys(global._rateLimit.ipStore).length,
    totalRequests: global._rateLimit.requestCount,
    ips: Object.keys(global._rateLimit.ipStore).map(ip => ({
      ip,
      count: global._rateLimit.ipStore[ip].count,
      resetTime: new Date(global._rateLimit.ipStore[ip].resetTime).toISOString()
    }))
  };
}

// Force create the data file immediately
try {
  // Try to load existing data
  loadDataFromDisk();
  
  // Create the file if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    console.log(`⚡ Creating new rate limit data file at: ${DATA_FILE}`);
    saveDataToDisk();
  }
} catch (error) {
  console.error('Error during rate limiter initialization:', error);
}

module.exports = {
  getRateInfo,
  getStatus,
  saveDataToDisk
};
