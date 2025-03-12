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
