import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Otelde bulunabilecek genel eşya kategorileri
const hotelCategories = [
  { category: "Mobilya", items: ["Yatak", "Dolap", "Masa", "Sandalye", "Koltuk", "Sehpa", "Masa Lambası"] },
  { category: "Elektronik", items: ["Televizyon", "Klima", "Telefon", "Bilgisayar", "Projektör"] },
  { category: "Banyo Ürünleri", items: ["Havlu", "Sabun", "Şampuan", "Bornoz", "Saç Kurutma Makinesi"] },
  { category: "Mutfak & Yiyecek", items: ["Minibar", "Kahve Makinesi", "Su Şişesi", "Atıştırmalık", "Çay Seti"] },
  { category: "Dekorasyon", items: ["Tablo", "Bitki", "Abajur", "Lamba", "Perde"] },
  { category: "Genel", items: ["Anahtar", "Kilit", "Oda Servisi Ekipmanı", "Temizlik Malzemesi", "Yedek Parça"] }
];

// Yemek & İçecek kategorisindeki ürünler
const foodCategory = { 
  category: "Yemek & İçecek", 
  items: [
    "Pizza", "Hamburger", "Salata", "Çorba", "Tost", "Sandviç", 
    "Kahve", "Çay", "Meyve Suyu", "Kola", "Dondurma", "Tatlı", 
    "Makarna", "Pilav", "Kebap", "Izgara Tavuk", "Sebze Yemeği", 
    "Balık", "Atıştırmalık"
  ]
};

// Deniz ürünleri örnekleri
const seafoodCategory = { 
  category: "Deniz Ürünleri", 
  items: ["Norveç Somonu", "Levrek", "Çipura", "Somon Füme", "Karides"]
};

// Tüm kategorileri birleştiriyoruz
const combinedCategories = [...hotelCategories, foodCategory, seafoodCategory];

// Rastgele eleman seçme fonksiyonu
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Rastgele ID oluşturma (8 karakterli alfasayısal)
function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Rastgele ürün kodu oluşturma: 3 rastgele harf (büyük harf) ve 3 rakam
function generateRandomCode() {
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
  const numbers = Math.floor(100 + Math.random() * 900);
  return letters + numbers;
}

// Alternatif ürünleri oluşturma: Seçilen ürünü hariç tutarak, en az 1 alternatif ekleniyor
function generateAlternatives(categoryObj, selectedItem) {
  let alternativesPool = categoryObj.items.filter(item => item !== selectedItem);
  if (alternativesPool.length === 0) {
    return [selectedItem];
  }
  // Rastgele alternatif sayısı: 1 ile alternativesPool uzunluğu arasında
  const count = Math.floor(Math.random() * alternativesPool.length) + 1;
  // Alternatifleri karıştır ve seç
  alternativesPool = alternativesPool.sort(() => 0.5 - Math.random());
  return alternativesPool.slice(0, count);
}

// Her kategori için countPerCategory adet rastgele ürün verisi oluşturma
function generateInventoryDataPerCategory(countPerCategory) {
  const data = [];
  combinedCategories.forEach(categoryObj => {
    const category = categoryObj.category;
    for (let i = 0; i < countPerCategory; i++) {
      const id = generateRandomId();
      const itemName = getRandomElement(categoryObj.items);
      const alternatives = generateAlternatives(categoryObj, itemName);
      const code = generateRandomCode();
      const description = getRandomElement([
        `${itemName} ürünü, ${category} kategorisinde yer almaktadır. Kaliteli ve dayanıklı ürün.`,
        `${itemName} ile günlük ihtiyaçlarınızı karşılayın. ${category} ürünlerinde öne çıkan bir ürün.`,
        `Müşteri memnuniyeti odaklı, ${category} kategorisinde bulunan ${itemName}.`,
        `${itemName} ürünü, yenilikçi tasarımı ve ${category} kalitesi ile dikkat çekiyor.`,
        `Güvenilir ve estetik, ${category} sektöründe tercih edilen ${itemName}.`
      ]);
      
      data.push({
        id,
        urunAdi: itemName,
        kod: code,
        kategori: category,
        aciklama: description,
        alternatifler: alternatives
      });
    }
  });
  return data;
}

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('MongoDB bağlantısı başarılı');
    
    const db = client.db("otelStokDB");
    const inventory = db.collection("inventory");
    
    // Mevcut verileri temizle
    await inventory.deleteMany({});
    
    // Her kategori için 100 adet rastgele ürün verisi oluştur
    const stockData = generateInventoryDataPerCategory(100);
    
    // Verileri topluca ekle
    const result = await inventory.insertMany(stockData);
    console.log(`${result.insertedCount} öğe başarıyla eklendi`);
  } catch (error) {
    console.error('Veri ekleme hatası:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
