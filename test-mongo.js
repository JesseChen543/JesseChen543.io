// Simple script to test MongoDB connection
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'portfolio';

// Log partial connection string for debugging (hide credentials)
const redactedUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://USERNAME:PASSWORD@');
console.log(`Attempting to connect to: ${redactedUri}`);

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('✅ Connected successfully to MongoDB server');
    
    // Try to access the database
    const db = client.db(dbName);
    console.log(`✅ Successfully accessed database: ${dbName}`);
    
    // Try to list collections to verify full access
    const collections = await db.listCollections().toArray();
    console.log(`✅ Successfully listed collections. Found ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if your MongoDB Atlas username and password are correct');
    console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas Network Access');
    console.log('3. Verify your connection string format is correct');
    console.log('4. Check if special characters in your password are properly URL encoded');
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testConnection().catch(console.error);
