export interface InventoryItem {
id: string;
urunAdi: string;
kod: string;
kategori: string;
aciklama: string;
alternatifler?: string[];
}

export const inventorySchema = {
id: String,
urunAdi: String,
kod: String,
kategori: String,
aciklama: String,
alternatifler: Array
};
