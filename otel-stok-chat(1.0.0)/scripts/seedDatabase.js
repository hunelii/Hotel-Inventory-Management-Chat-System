import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


dotenv.config();

const sampleData = [
{
 id: "001",
 urunAdi: "Norveç Somonu",
 kod: "BALIK001",
 kategori: "Deniz Ürünleri",
 aciklama: "Taze Norveç somonu, 1kg paketlenmiş",
 alternatifler: ["BALIK002", "BALIK004"]
},
{
 id: "002",
 urunAdi: "Levrek",
 kod: "BALIK002",
 kategori: "Deniz Ürünleri",
 aciklama: "Taze levrek, adet",
 alternatifler: ["BALIK001", "BALIK003"]
},
{
 id: "003",
 urunAdi: "Çipura",
 kod: "BALIK003",
 kategori: "Deniz Ürünleri",
 aciklama: "Taze çipura, adet",
 alternatifler: ["BALIK002"]
},
{
 id: "004",
 urunAdi: "Somon Füme",
 kod: "BALIK004",
 kategori: "Deniz Ürünleri",
 aciklama: "Füme edilmiş somon, 250g paket",
 alternatifler: ["BALIK001"]
},
{
 id: "005",
 urunAdi: "Karides",
 kod: "DENIZ001",
 kategori: "Deniz Ürünleri",
 aciklama: "Temizlenmiş jumbo karides, kg",
 alternatifler: []
}
];

async function seedDatabase() {
const client = new MongoClient(process.env.MONGODB_URI);

try {
 await client.connect();
 console.log('MongoDB bağlantısı başarılı');
 
 const db = client.db("otelStokDB");
 const inventory = db.collection("inventory");
 
 // Mevcut verileri temizle
 await inventory.deleteMany({});
 
 // Yeni verileri ekle
 const result = await inventory.insertMany(sampleData);
 console.log(`${result.insertedCount} öğe başarıyla eklendi`);
} catch (error) {
 console.error('Veri ekleme hatası:', error);
} finally {
 await client.close();
}
}

seedDatabase();
