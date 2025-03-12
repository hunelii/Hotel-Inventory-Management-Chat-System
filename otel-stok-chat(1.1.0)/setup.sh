#!/bin/bash

# Gerekli bağımlılıkları yükle
npm install mongodb axios @google/generative-ai dotenv react-markdown

# Ana klasörleri oluştur
mkdir -p app/api/query
mkdir -p app/api/inventory
mkdir -p components
mkdir -p lib
mkdir -p models
mkdir -p utils
mkdir -p public/icons
mkdir -p scripts
mkdir -p __tests__

# Env dosyasını oluştur
cat > .env.local << 'EOF'
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
EOF

# .gitignore güncelle
cat >> .gitignore << 'EOF'
# env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF

# README dosyasını oluştur
cat > README.md << 'EOF'
# Otel Stok Yönetim Sistemi

Bu uygulama, otel çalışanlarının stok yönetim sistemi hakkında sorular sorabilmesini sağlayan AI destekli bir sohbet arayüzü sunar.

## Özellikler

- Doğal dil sorguları ile stok bilgilerine erişim
- Ürün kodları ve alternatifler hakkında bilgi alma
- Hızlı ve kullanıcı dostu arayüz

## Kullanım

1. Tarayıcınızda uygulamayı açın
2. Sohbet kutusuna sorgunuzu yazın (örn. "somon balığı kodu nedir?")
3. Gönder düğmesine tıklayın
4. AI tarafından üretilen yanıtı görüntüleyin

## Teknik Bilgiler

- Next.js ile geliştirilmiştir
- Gemini 2.0 Flash AI API'si kullanılmıştır
- MongoDB veritabanı kullanılmıştır
EOF

# Geliştirici dokümanı oluştur
cat > DEVELOPMENT.md << 'EOF'
# Geliştirici Dokümantasyonu

## Kurulum

1. Repo'yu klonlayın
2. `npm install` ile bağımlılıkları yükleyin
3. `.env.local` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_api_key
4. `npm run dev` ile geliştirme sunucusunu başlatın

## Mimari

### Frontend

- Next.js App Router kullanılmıştır
- React bileşenleri `components/` dizininde bulunmaktadır
- Sayfa yönlendirmeleri `app/` dizininde bulunmaktadır

### Backend

- API endpointleri `app/api/` dizininde bulunmaktadır
- Veritabanı bağlantısı `lib/mongodb.js` dosyasında yönetilmektedir
- Gemini AI entegrasyonu `lib/gemini.js` dosyasında bulunmaktadır

## Veri Akışı

1. Kullanıcı sorgusu `/api/query` endpointine gönderilir
2. Sorgudaki anahtar kelimeler çıkarılır
3. MongoDB'den ilgili veriler getirilir
4. Gemini AI'a sorgu ve bağlam gönderilir
5. AI yanıtı kullanıcıya döndürülür
EOF

# Ana sayfa bileşenini oluştur
cat > app/page.tsx << 'EOF'
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
return (
 <main className="min-h-screen p-4 md:p-8">
   <div className="max-w-4xl mx-auto">
     <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
       Otel Stok Yönetim Sistemi
     </h1>
     <ChatInterface />
   </div>
 </main>
);
}
EOF

# MongoDB bağlantı hizmetini oluştur
cat > lib/mongodb.ts << 'EOF'
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
let globalWithMongo = global as typeof globalThis & {
 _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
 client = new MongoClient(uri, options);
 globalWithMongo._mongoClientPromise = client.connect();
}
clientPromise = globalWithMongo._mongoClientPromise;
} else {
// In production mode, it's best to not use a global variable.
client = new MongoClient(uri, options);
clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
EOF

# Gemini AI hizmetini oluştur
cat > lib/gemini.ts << 'EOF'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiResponse(prompt: string, context: any[]) {
try {
 if (!process.env.GEMINI_API_KEY) {
   throw new Error("GEMINI_API_KEY is not set in environment variables");
 }
 
 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 
 // Bağlam ile sorguyu birleştir
 const fullPrompt = `
   Aşağıdaki bilgilere dayanarak, kullanıcının sorusuna yanıt ver:
   
   STOK BİLGİLERİ:
   ${JSON.stringify(context)}
   
   KULLANICI SORUSU:
   ${prompt}
   
   Lütfen sadece verilen stok bilgilerine dayanarak yanıt ver. Eğer soruda belirtilen ürünle ilgili bir bilgi yoksa, bunu belirt.
 `;
 
 const result = await model.generateContent(fullPrompt);
 const response = result.response;
 return response.text();
} catch (error) {
 console.error("Gemini API hatası:", error);
 throw error;
}
}
EOF

# Veri çekme hizmetini oluştur
cat > lib/dataRetrieval.ts << 'EOF'
import clientPromise from './mongodb';

export async function retrieveRelevantData(keywords: string[]) {
try {
 const client = await clientPromise;
 const db = client.db("otelStokDB");
 const inventory = db.collection("inventory");
 
 // Her bir anahtar kelime için sorgu nesnesi oluştur
 const queryConditions = keywords.map(keyword => ({
   $or: [
     { urunAdi: { $regex: keyword, $options: 'i' } },
     { aciklama: { $regex: keyword, $options: 'i' } },
     { kategori: { $regex: keyword, $options: 'i' } },
     { kod: { $regex: keyword, $options: 'i' } }
   ]
 }));
 
 // En az bir anahtar kelime eşleşmeli
 const query = queryConditions.length > 0 ? { $or: queryConditions } : {};
 
 // Verileri getir
 const data = await inventory.find(query).limit(10).toArray();
 return data;
} catch (error) {
 console.error("Veri çekme hatası:", error);
 throw error;
}
}
EOF

# Oturum yönetimi hizmetini oluştur
cat > lib/sessionStorage.ts << 'EOF'
export interface ChatMessage {
id: number;
text: string;
isUser: boolean;
context?: any[];
error?: boolean;
}

export function saveMessageHistory(messages: ChatMessage[]) {
if (typeof window !== 'undefined') {
 localStorage.setItem('chatHistory', JSON.stringify(messages));
}
}

export function loadMessageHistory(): ChatMessage[] | null {
if (typeof window !== 'undefined') {
 const saved = localStorage.getItem('chatHistory');
 return saved ? JSON.parse(saved) : null;
}
return null;
}
EOF

# Sorgu işleme yardımcısını oluştur
cat > utils/queryParser.ts << 'EOF'
export function extractKeywords(query: string): string[] {
// Basit bir implementasyon - gerçek projede daha gelişmiş NLP kullanılabilir
const stopWords = ["bu", "ne", "nedir", "nasıl", "hangi", "ve", "veya", "için"];
const words = query.toLowerCase().split(/\s+/);
return words
 .filter(word => word.length > 2 && !stopWords.includes(word))
 .map(word => word.replace(/[.,?!;:]/g, ''));
}
EOF

# Envanter modelini oluştur
cat > models/Inventory.ts << 'EOF'
export interface InventoryItem {
id: string;
urunAdi: string;
kod: string;
kategori: string;
aciklama: string;
alternatifler?: string[];
}

export const inventorySchema = {
id: String,
urunAdi: String,
kod: String,
kategori: String,
aciklama: String,
alternatifler: Array
};
EOF

# Sorgu API endpoint'ini oluştur
cat > app/api/query/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { extractKeywords } from '@/utils/queryParser';
import { retrieveRelevantData } from '@/lib/dataRetrieval';
import { getGeminiResponse } from '@/lib/gemini';

export async function POST(request: Request) {
try {
 const { query } = await request.json();
 
 if (!query) {
   return NextResponse.json({ error: 'Sorgu boş olamaz' }, { status: 400 });
 }
 
 // Anahtar kelimeleri çıkar
 const keywords = extractKeywords(query);
 
 // İlgili verileri getir
 const relevantData = await retrieveRelevantData(keywords);
 
 // Gemini AI'dan yanıt al
 const aiResponse = await getGeminiResponse(query, relevantData);
 
 return NextResponse.json({ 
   response: aiResponse,
   context: relevantData 
 });
} catch (error) {
 console.error('API Hatası:', error);
 return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
}
}
EOF

# Envanter listeleme API endpoint'ini oluştur
cat > app/api/inventory/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
try {
 const client = await clientPromise;
 const db = client.db("otelStokDB");
 const inventory = db.collection("inventory");
 
 const items = await inventory.find({}).limit(100).toArray();
 
 return NextResponse.json(items);
} catch (error) {
 console.error('Envanter API Hatası:', error);
 return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
}
}
EOF

# Sohbet arayüzü bileşenini oluştur
cat > components/ChatInterface.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType, saveMessageHistory, loadMessageHistory } from '@/lib/sessionStorage';

export default function ChatInterface() {
const [messages, setMessages] = useState<ChatMessageType[]>([
 { id: 1, text: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.', isUser: false }
]);
const [loading, setLoading] = useState(false);

// Sayfa yüklendiğinde geçmiş mesajları yükle
useEffect(() => {
 const savedMessages = loadMessageHistory();
 if (savedMessages && savedMessages.length > 0) {
   setMessages(savedMessages);
 }
}, []);

// Mesajlar değiştiğinde yerel depolamaya kaydet
useEffect(() => {
 saveMessageHistory(messages);
}, [messages]);

const handleSendMessage = async (text: string) => {
 if (!text.trim()) return;
 
 // Kullanıcı mesajını ekle
 const userMessageId = Date.now();
 setMessages(prev => [...prev, { id: userMessageId, text, isUser: true }]);
 
 // Yükleniyor durumunu ayarla
 setLoading(true);
 
 try {
   // API'ye istek gönder
   const response = await fetch('/api/query', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ query: text })
   });
   
   const data = await response.json();
   
   if (!response.ok) {
     throw new Error(data.error || 'Bir hata oluştu');
   }
   
   // Bot yanıtını ekle
   setMessages(prev => [
     ...prev, 
     { id: Date.now(), text: data.response, isUser: false, context: data.context }
   ]);
 } catch (error) {
   console.error('Mesaj gönderme hatası:', error);
   setMessages(prev => [
     ...prev, 
     { id: Date.now(), text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', isUser: false, error: true }
   ]);
 } finally {
   setLoading(false);
 }
};

return (
 <div className="flex flex-col h-[70vh] bg-gray-50 rounded-lg shadow-md overflow-hidden">
   <div className="flex-1 overflow-y-auto p-4">
     {messages.map(message => (
       <ChatMessage key={message.id} message={message} />
     ))}
     {loading && (
       <div className="flex items-center my-2">
         <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
         <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
         <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
       </div>
     )}
   </div>
   <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
 </div>
);
}
EOF

# Mesaj bileşenini oluştur
cat > components/ChatMessage.tsx << 'EOF'
import { ChatMessage as ChatMessageType } from '@/lib/sessionStorage';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
const { text, isUser, context, error } = message;

return (
 <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
   <div 
     className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
       isUser 
         ? 'bg-blue-500 text-white' 
         : error 
           ? 'bg-red-100 text-red-800'
           : 'bg-gray-200 text-gray-800'
     }`}
   >
     <ReactMarkdown className="whitespace-pre-wrap">{text}</ReactMarkdown>
     
     {context && context.length > 0 && (
       <div className="mt-2 text-xs opacity-75">
         <p>İlgili stok öğeleri: {context.length}</p>
       </div>
     )}
   </div>
 </div>
);
}
EOF

# Giriş bileşenini oluştur
cat > components/ChatInput.tsx << 'EOF'
import { useState } from 'react';

interface ChatInputProps {
onSendMessage: (text: string) => void;
disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
const [input, setInput] = useState('');

const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (input.trim() && !disabled) {
   onSendMessage(input);
   setInput('');
 }
};

return (
 <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
   <div className="flex">
     <input
       type="text"
       value={input}
       onChange={(e) => setInput(e.target.value)}
       disabled={disabled}
       placeholder="Stok sistemi hakkında bir soru sorun..."
       className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
     />
     <button
       type="submit"
       disabled={disabled || !input.trim()}
       className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
     >
       Gönder
     </button>
   </div>
 </form>
);
}
EOF

# Veritabanı seed script'ini oluştur
cat > scripts/seedDatabase.js << 'EOF'
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

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
EOF

# Veritabanı indeks oluşturma script'ini oluştur
cat > scripts/createIndexes.js << 'EOF'
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
EOF

# Test dosyası oluştur
cat > __tests__/api.test.js << 'EOF'
import { describe, expect, test, jest } from '@jest/globals';
import { POST } from '../app/api/query/route';

// Mock modülleri
jest.mock('../lib/mongodb');
jest.mock('../lib/gemini');
jest.mock('../lib/dataRetrieval');

describe('API route handler', () => {
test('returns 400 when query is empty', async () => {
 const req = {
   json: jest.fn().mockResolvedValue({})
 };
 
 const response = await POST(req);
 expect(response.status).toBe(400);
});
});
EOF

# package.json dosyasını güncelle (seed script'i için)
jq '.scripts += {"seed": "node --experimental-json-modules scripts/seedDatabase.js", "create-indexes": "node --experimental-json-modules scripts/createIndexes.js"}' package.json > tmp.$$.json && mv tmp.$$.json package.json

echo "Proje dosya yapısı başarıyla oluşturuldu!"