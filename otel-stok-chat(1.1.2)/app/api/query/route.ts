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
    
    // Classify the query.
    const { type, keywords } = classifyQuery(query);
    
    // If it's a greeting, reply immediately.
    if (type === "greeting") {
      return NextResponse.json({ response: "Merhaba! Otel stok sistemi hakkında nasıl yardımcı olabilirim?" });
    }
    
    const client = await clientPromise;
    const db = client.db("otelStokDB");
    
    // Retrieve relevant inventory data.
    const relevantData = await retrieveRelevantData(keywords);
    
    // If no relevant data is found, log the query as feedback.
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
    
    // Get the response from Gemini API.
    const aiResponse = await getGeminiResponse(query, relevantData);
    return NextResponse.json({ response: aiResponse, context: relevantData });
  } catch (error) {
    console.error('API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
