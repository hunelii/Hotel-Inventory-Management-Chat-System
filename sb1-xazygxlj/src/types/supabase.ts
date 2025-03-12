export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  alternatives?: string[];
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at'>;
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at'>>;
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          role: 'user' | 'assistant';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['chat_history']['Row'], 'id' | 'created_at'>>;
      };
    };
  };
}