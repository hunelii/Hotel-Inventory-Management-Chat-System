import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { classifyQuery } from '@/utils/queryParser';
import { retrieveRelevantData } from '@/lib/dataRetrieval';
import { getGeminiResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Sorgu boş olamaz' }, { status: 400 });
    }
    
    // Sorguyu sınıflandırın
    const { type, keywords } = classifyQuery(query);
    
    // Eğer sorgu bir selamlama ise
    if (type === "greeting") {
      return NextResponse.json({ response: "Merhaba! Otel stok sistemi hakkında nasıl yardımcı olabilirim?" });
    }
    
    // MongoDB bağlantısını al
    const client = await clientPromise;
    const db = client.db("otelStokDB");
    
    // İlgili verileri getir
    const relevantData = await retrieveRelevantData(keywords);
    
    // Eğer stok verisi boşsa, geri bildirim olarak sorguyu loglayın
    if (relevantData.length === 0) {
      try {
        const feedback = {
          query,
          keywords,
          timestamp: new Date().toISOString()
        };
        await db.collection("feedback").insertOne(feedback);
      } catch (logError) {
        console.error("Geri bildirim kaydı hatası:", logError);
      }
      return NextResponse.json({ 
        response: "Üzgünüm, sorgunuz belirsiz veya ilgili stok bilgisi bulunamadı. Lütfen daha spesifik bilgi veriniz." 
      });
    }
    
    // Gemini AI'dan yanıt al
    const aiResponse = await getGeminiResponse(query, relevantData);
    return NextResponse.json({ response: aiResponse, context: relevantData });
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
