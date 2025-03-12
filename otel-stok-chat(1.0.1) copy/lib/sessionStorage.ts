import { Message } from '@/components/ChatMessage';

export function saveMessageHistory(messages: Message[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }
}

export function loadMessageHistory(): Message[] | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}
