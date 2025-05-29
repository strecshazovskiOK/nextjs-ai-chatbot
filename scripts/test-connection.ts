import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  // Log the connection string with credentials hidden
  console.log('Connection string format:', uri.replace(/\/\/(.*?)@/, '//*****@'));
  
  const client = new MongoClient(uri, {
    // Add these options for more detailed error reporting
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');

    // Test database operations
    const db = client.db('stock_info');
    console.log('Connected to database: stock_info');
    
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Try to ping the database
    const pingResult = await db.command({ ping: 1 });
    console.log('Ping result:', pingResult);

  } catch (error) {
    console.error('Connection error details:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      // @ts-ignore
      if (error.code) {
        // @ts-ignore
        console.error('Error code:', error.code);
      }
    }
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection(); 