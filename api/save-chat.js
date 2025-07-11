const { connectToDatabase } = require('./mongodb');
const { rateLimiter } = require('./rate-limiter');

async function saveChatData(chatData) {
  try {
    console.log('Connecting to MongoDB to save chat data...');
    const { db } = await connectToDatabase();
    const collection = db.collection('chatLogs');
    const result = await collection.insertOne({
      ...chatData,
      createdAt: new Date(),
    });
    console.log(`Chat log saved to MongoDB with ID: ${result.insertedId}`);
    return true;
  } catch (error) {
    console.error('Error saving chat log to MongoDB:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rateLimitOptions = {
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000, // 24 hour window
  };

  // Apply rate limiting
  const rateLimitPassed = await rateLimiter(req, res, rateLimitOptions);
  if (!rateLimitPassed) {
    return; // Exit immediately if rate limit is exceeded
  }

  try {
    const { userMessage, aiResponse, userInfo = {} } = req.body;

    if (!userMessage || !aiResponse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { 
      referrer = '',
      page = '',
      timestamp = new Date().toISOString(),
    } = userInfo;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const anonymizedIp = Buffer.from(ip).toString('base64');

    const chatData = {
      userMessage,
      aiResponse,
      anonymizedIp,
      referrer,
      page,
      clientTimestamp: timestamp,
    };

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