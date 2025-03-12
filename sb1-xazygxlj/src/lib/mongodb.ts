import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongoDB() {
  try {
    await client.connect();
    return client.db('hotel_inventory');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function searchInventory(query: string) {
  const db = await connectToMongoDB();
  try {
    return await db.collection('inventory').find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  } finally {
    await client.close();
  }
}

export async function saveChatMessage(userId: string, message: string, role: 'user' | 'assistant') {
  const db = await connectToMongoDB();
  try {
    await db.collection('chat_history').insertOne({
      userId,
      message,
      role,
      createdAt: new Date()
    });
  } finally {
    await client.close();
  }
}