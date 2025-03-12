// app/api/query/route.ts
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
    
    // Selamlaşma kontrolü: Eğer sorgu bir selamlama içeriyorsa, stok verilerini sorgulamaya gerek yok
    const lowerQuery = query.toLowerCase().trim();
    const greetings = ["merhaba", "selam", "naber", "iyi günler"];
    if (greetings.some(greet => lowerQuery.includes(greet))) {
      return NextResponse.json({ 
        response: "Merhaba! Otel stok sistemi hakkında nasıl yardımcı olabilirim?" 
      });
    }

    // Anahtar kelimeleri çıkar ve ilgili stok verilerini çek
    const keywords = extractKeywords(query);
    const relevantData = await retrieveRelevantData(keywords);

    // Eğer stok verisi boşsa, kullanıcıya daha açıklayıcı bir mesaj döndür
    if (relevantData.length === 0) {
      return NextResponse.json({ 
        response: "Üzgünüm, stok bilgileri mevcut değil. Lütfen stok verilerinizi kontrol edin veya daha detaylı bir sorgu deneyin."
      });
    }

    // Gemini AI ile yanıt oluştur
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
