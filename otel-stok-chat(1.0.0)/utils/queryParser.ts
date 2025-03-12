export function extractKeywords(query: string): string[] {
// Basit bir implementasyon - gerçek projede daha gelişmiş NLP kullanılabilir
const stopWords = ["bu", "ne", "nedir", "nasıl", "hangi", "ve", "veya", "için"];
const words = query.toLowerCase().split(/\s+/);
return words
 .filter(word => word.length > 2 && !stopWords.includes(word))
 .map(word => word.replace(/[.,?!;:]/g, ''));
}
