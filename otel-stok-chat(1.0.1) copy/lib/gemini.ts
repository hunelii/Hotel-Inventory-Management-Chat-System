import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getGeminiResponse(prompt, context) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const fullPrompt = `
      Aşağıdaki bilgilere dayanarak, kullanıcının sorusuna yanıt ver.
      Eğer sorguda belirsizlik veya eksik bilgi varsa, önce netleştirici sorular sorarak tam olarak ne istediğini anlamaya çalış.
      
      STOK BİLGİLERİ:
      ${JSON.stringify(context)}
      
      KULLANICI SORUSU:
      ${prompt}
      
      Lütfen yalnızca verilen stok bilgilerine dayanarak yanıt oluştur. Eğer sorguyla ilgili yeterli veri yoksa, bunu belirtip ek sorular sorun.
    `;
    
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API hatası:", error);
    throw error;
  }
}
