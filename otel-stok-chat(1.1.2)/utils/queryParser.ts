// utils/queryParser.ts

export function classifyQuery(query: string): { type: "greeting" | "stock"; keywords: string[] } {
  const lowerQuery = query.toLowerCase();
  const greetings = ["merhaba", "selam", "naber", "nasılsın"];
  const isGreeting = greetings.some(greet => lowerQuery.includes(greet));

  if (isGreeting) {
    return { type: "greeting", keywords: [] };
  }

  const stopWords = ["bu", "ne", "nedir", "nasıl", "hangi", "ve", "veya", "için"];
  const words = lowerQuery.split(/\s+/);
  const keywords = words
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => word.replace(/[.,?!;:]/g, ''));

  return { type: "stock", keywords };
}
