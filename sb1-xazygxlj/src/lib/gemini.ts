import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchInventory, saveChatMessage } from './mongodb';
import type { InventoryItem } from '../types/mongodb';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function getChatResponse(messages: string[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const latestMessage = messages[messages.length - 1];
    
    // RAG: Fetch relevant inventory items based on the user's query
    const relevantItems = await searchInventory(latestMessage);
    
    const prompt = `
      You are an AI assistant for a hotel inventory management system. 
      Help the staff with their queries about inventory items, codes, and alternatives.
      
      Current inventory context:
      ${JSON.stringify(relevantItems, null, 2)}
      
      Previous conversation:
      ${messages.join('\n')}
      
      Please provide accurate information based on the inventory data provided above.
      If the requested item is not found in the inventory context, please indicate that.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get response from Gemini');
  }
}

export async function saveChat(userId: string, message: string, role: 'user' | 'assistant') {
  await saveChatMessage(userId, message, role);
}