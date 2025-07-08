// MongoDB connection utility
const { MongoClient } = require('mongodb');

// Load environment variables - for local development
let config = {};
try {
  config = require('./config');
} catch (error) {
  console.log('Config file not found, using environment variables only');
}

// Connection URI - first check environment variables, then config file
const uri = process.env.MONGODB_URI || (config && config.mongodb && config.mongodb.uri);
const dbName = process.env.MONGODB_DB_NAME || (config && config.mongodb && config.mongodb.dbName) || 'portfolio';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

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
    throw new Error('MongoDB URI not found in environment variables or config file');
  }

  // Create a new MongoClient
  const client = new MongoClient(uri, options);

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
