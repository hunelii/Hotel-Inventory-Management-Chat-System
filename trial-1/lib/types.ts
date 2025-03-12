export interface InventoryItem {
  _id: string;
  urunAdi: string;
  kod: string;
  kategori: string;
  aciklama: string;
  stokMiktari: number;
  birim: string;
  alternatifler?: string[];
  sonGuncelleme: Date;
  kritikStokSeviyesi?: number;
  tedarikci?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}