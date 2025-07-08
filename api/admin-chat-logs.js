// Admin API to retrieve chat logs
const { connectToDatabase } = require('./mongodb');

// Simple auth check - IMPROVE THIS IN PRODUCTION!
function checkAdminAuth(req) {
  // Get the admin token from query parameters or headers
  const adminToken = req.query.token || req.headers['x-admin-token'];
  
  // In production, use a proper authentication system and store tokens securely
  // This is just for demonstration - replace with your own secure method
  const validToken = process.env.ADMIN_TOKEN || 'admin-token-replace-me';
  
  return adminToken === validToken;
}

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check admin authentication
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get search filter
    const searchQuery = req.query.query || '';
    let filter = {};
    
    // Apply search filter if provided
    if (searchQuery) {
      filter = {
        $or: [
          { userMessage: { $regex: searchQuery, $options: 'i' } },
          { aiResponse: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }
    
    // Get the chat logs collection
    const collection = db.collection('chatLogs');
    
    // Get total count for pagination
    const total = await collection.countDocuments(filter);
    
    // Get the chat logs with pagination
    const logs = await collection
      .find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Return the results
    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
