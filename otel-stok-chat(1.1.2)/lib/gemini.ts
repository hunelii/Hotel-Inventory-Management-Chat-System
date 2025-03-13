// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiResponse(prompt: string, context: unknown[]): Promise<string> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
// Inside getGeminiResponse in lib/gemini.ts, after obtaining the model:
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  // Example parameter: lower temperature for more deterministic responses
  temperature: 0.3  
});

    
    // Refined prompt template with clear instructions
    const fullPrompt = `
      Aşağıdaki stok bilgilerine dayanarak, kullanıcının sorusuna detaylı yanıt ver.
      Eğer sorguda belirsizlik varsa veya ek bilgi gerekiyorsa, lütfen önce netleştirici sorular sorarak eksik bilgiyi tamamlayın.
      
      STOK BİLGİLERİ:
      ${JSON.stringify(context)}
      
      KULLANICI SORUSU:
      ${prompt}
      
      Yanıtınızı yalnızca mevcut stok bilgilerine dayandırın. Eğer yeterli veri yoksa, hangi bilgilerin gerektiğini belirtin.
    `;
    
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API hatası:", error);
    throw error;
  }
}
