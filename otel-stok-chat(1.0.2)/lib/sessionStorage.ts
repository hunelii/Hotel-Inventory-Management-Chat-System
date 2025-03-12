export interface ChatMessage {
id: number;
text: string;
isUser: boolean;
context?: unknown[];
error?: boolean;
}

export function saveMessageHistory(messages: ChatMessage[]) {
if (typeof window !== 'undefined') {
 localStorage.setItem('chatHistory', JSON.stringify(messages));
}
}

export function loadMessageHistory(): ChatMessage[] | null {
if (typeof window !== 'undefined') {
 const saved = localStorage.getItem('chatHistory');
 return saved ? JSON.parse(saved) : null;
}
return null;
}
