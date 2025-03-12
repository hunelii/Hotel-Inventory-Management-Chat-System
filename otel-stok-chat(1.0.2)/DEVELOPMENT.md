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
