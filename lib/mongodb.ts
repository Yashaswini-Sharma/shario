import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shario';
let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  try {
    if (!uri || uri === '') {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    if (!client || !db) {
      console.log('Connecting to MongoDB with URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
      client = new MongoClient(uri);
      await client.connect();
      db = client.db();
      console.log('Successfully connected to MongoDB');
    }
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
