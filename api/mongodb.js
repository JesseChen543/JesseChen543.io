// api/mongodb.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'Portfolio';

// Connection cache
let cachedClient = null;
let cachedDb = null;

/**
 * Connects to MongoDB and returns the database instance
 * Uses connection pooling by caching the client and db instances
 */
async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    console.log('Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  // Check if URI is defined
  if (!uri) {
    throw new Error('MongoDB URI not defined in environment variable (MONGODB_URI)');
  }

  // Create a new MongoClient
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  });

  try {
    // Connect to the MongoDB server
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');

    // Get reference to the database
    const db = client.db(dbName);

    // Cache the client and database instances
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };
