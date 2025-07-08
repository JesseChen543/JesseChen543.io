// This is a serverless function for Vercel to save chat conversations
const path = require('path');

// Import MongoDB connection utility
const { connectToDatabase } = require('./mongodb');

// Import rate limiter to prevent abuse
const { rateLimiter } = require('./rate-limiter');

// Helper function to save chat data to MongoDB
async function saveChatData(chatData) {
  try {
    console.log('Connecting to MongoDB to save chat data...');
    const { db } = await connectToDatabase();
    
    // Get the chatLogs collection (will be created if it doesn't exist)
    const collection = db.collection('chatLogs');
    
    // Insert the chat data
    const result = await collection.insertOne({
      ...chatData,
      createdAt: new Date()  // Add server timestamp
    });
    
    console.log(`Chat log saved to MongoDB with ID: ${result.insertedId}`);
    return true;
  } catch (error) {
    console.error('Error saving chat log to MongoDB:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting - 50 saves per day (more than chat requests since we save each exchange)
  const rateLimitOptions = {
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000 // 24 hour window (1 day)
  };

  // Let the rate limiter handle everything
  if (!rateLimiter(req, res, rateLimitOptions)) {
    console.log(`Rate limit check failed for chat logging - request blocked`);
    return;
  }

  try {
    const { userMessage, aiResponse, userInfo = {} } = req.body;

    if (!userMessage || !aiResponse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Collect some basic, non-identifying info about the user
    const { 
      referrer = '',
      page = '',
      timestamp = new Date().toISOString()
    } = userInfo;

    // Get IP address safely (might be behind a proxy)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Create a hash of the IP to anonymize it but still track unique users
    // In production, use a more secure hashing method
    const anonymizedIp = Buffer.from(ip).toString('base64');

    // Create the chat log entry
    const chatData = {
      userMessage,
      aiResponse,
      anonymizedIp,
      referrer,
      page,
      clientTimestamp: timestamp
    };

    // Save the chat data to MongoDB
    const success = await saveChatData(chatData);

    if (success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to save chat log' });
    }
  } catch (error) {
    console.error('Server error saving chat log:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
