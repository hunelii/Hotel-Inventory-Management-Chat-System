// lib/dataRetrieval.js
import clientPromise from './mongodb';

export async function retrieveRelevantData(keywords: string | string[]) {
  try {
    const client = await clientPromise;
    const db = client.db("otelStokDB");
    const inventory = db.collection("inventory");

    // Check if keywords is an array and contains "stok" or "stokta"
    if (Array.isArray(keywords) && keywords.some(kw => ["stok", "stokta"].includes(kw))) {
      return await inventory.find({}).toArray();
    }
    
    // Anahtar kelimelere göre sorgu oluşturma
    const queryConditions = keywords.map(keyword => ({
      $or: [
        { urunAdi: { $regex: keyword, $options: 'i' } },
        { aciklama: { $regex: keyword, $options: 'i' } },
        { kategori: { $regex: keyword, $options: 'i' } },
        { kod: { $regex: keyword, $options: 'i' } }
      ]
    }));

    // Sorgu koşulları varsa onları kullan, yoksa boş obje ile sorgu yap.
    const query = queryConditions.length > 0 ? { $or: queryConditions } : {};
    const data = await inventory.find(query).limit(10).toArray();
    return data;
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    throw error;
  }
}
