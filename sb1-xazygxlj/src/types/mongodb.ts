export interface InventoryItem {
  _id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  alternatives?: string[];
  createdAt: Date;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  message: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}