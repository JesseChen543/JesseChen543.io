// Simple test endpoint for Vercel deployment

module.exports = function handler(req, res) {
  return res.status(200).json({ 
    status: 'success', 
    message: 'API is working correctly', 
    timestamp: new Date().toISOString(),
    environment: {
      // List some environment variables (without revealing sensitive data)
      hasApiKey: process.env.OPENAI_API_KEY ? true : false,
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercelEnv: process.env.VERCEL_ENV || 'not set'
    }
  });
}
