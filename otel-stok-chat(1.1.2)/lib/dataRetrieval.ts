import clientPromise from './mongodb';
import { InventoryItem } from '@/models/Inventory';

export async function retrieveRelevantData(keywords: string[]): Promise<InventoryItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("otelStokDB");
    // Provide a generic type for the collection so TypeScript knows the shape.
    const inventory = db.collection<InventoryItem>("inventory");

    // If keywords includes "stok" or "stokta", return all products.
    if (keywords.some(kw => ["stok", "stokta"].includes(kw))) {
      return await inventory.find({}).toArray();
    }

    // Build query conditions for each keyword.
    const queryConditions = keywords.map(keyword => ({
      $or: [
        { urunAdi: { $regex: keyword, $options: 'i' } },
        { aciklama: { $regex: keyword, $options: 'i' } },
        { kategori: { $regex: keyword, $options: 'i' } },
        { kod: { $regex: keyword, $options: 'i' } }
      ]
    }));

    const query = queryConditions.length > 0 ? { $or: queryConditions } : {};
    const data = await inventory.find(query).limit(10).toArray();
    return data;
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    throw error;
  }
}
