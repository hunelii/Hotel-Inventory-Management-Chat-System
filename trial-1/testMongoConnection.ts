import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MongoDB URI is not set in environment variables.');
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  } finally {
    await client.close();
  }
}

testConnection();
