import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function createIndexes() {
const client = new MongoClient(process.env.MONGODB_URI);

try {
 await client.connect();
 const db = client.db("otelStokDB");
 const inventory = db.collection("inventory");
 
 // Arama performansını artıracak indeksler
 await inventory.createIndex({ urunAdi: "text", aciklama: "text", kategori: "text" });
 await inventory.createIndex({ kod: 1 }, { unique: true });
 
 console.log('İndeksler başarıyla oluşturuldu');
} catch (error) {
 console.error('İndeks oluşturma hatası:', error);
} finally {
 await client.close();
}
}

createIndexes();
