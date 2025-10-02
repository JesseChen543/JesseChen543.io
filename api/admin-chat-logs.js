// Admin API to retrieve chat logs
import { connectToDatabase } from '../lib/mongodb.js';
import { verifyToken, extractTokenFromRequest } from '../lib/auth-utils.js';

// JWT-based authentication check for admin access
function checkAdminAuth(req) {
  // Extract the JWT token from the request
  const token = extractTokenFromRequest(req);

  if (!token) {
    return false;
  }

  // Verify the JWT token
  const decoded = verifyToken(token);

  // Check if token is valid and has admin role
  return decoded && decoded.role === 'admin';
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

    // Get search filter with sanitization
    const searchQuery = req.query.query || '';
    let filter = {};

    // Apply search filter if provided (sanitize to prevent NoSQL injection)
    if (searchQuery) {
      // Escape special regex characters to prevent ReDoS attacks
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = {
        $or: [
          { userMessage: { $regex: escapedQuery, $options: 'i' } },
          { aiResponse: { $regex: escapedQuery, $options: 'i' } }
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
