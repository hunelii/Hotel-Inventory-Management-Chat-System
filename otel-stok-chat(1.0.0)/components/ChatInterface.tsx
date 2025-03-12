'use client';

import { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType, saveMessageHistory, loadMessageHistory } from '@/lib/sessionStorage';

export default function ChatInterface() {
const [messages, setMessages] = useState<ChatMessageType[]>([
 { id: 1, text: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.', isUser: false }
]);
const [loading, setLoading] = useState(false);

// Sayfa yüklendiğinde geçmiş mesajları yükle
useEffect(() => {
 const savedMessages = loadMessageHistory();
 if (savedMessages && savedMessages.length > 0) {
   setMessages(savedMessages);
 }
}, []);

// Mesajlar değiştiğinde yerel depolamaya kaydet
useEffect(() => {
 saveMessageHistory(messages);
}, [messages]);

const handleSendMessage = async (text: string) => {
 if (!text.trim()) return;
 
 // Kullanıcı mesajını ekle
 const userMessageId = Date.now();
 setMessages(prev => [...prev, { id: userMessageId, text, isUser: true }]);
 
 // Yükleniyor durumunu ayarla
 setLoading(true);
 
 try {
   // API'ye istek gönder
   const response = await fetch('/api/query', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ query: text })
   });
   
   const data = await response.json();
   
   if (!response.ok) {
     throw new Error(data.error || 'Bir hata oluştu');
   }
   
   // Bot yanıtını ekle
   setMessages(prev => [
     ...prev, 
     { id: Date.now(), text: data.response, isUser: false, context: data.context }
   ]);
 } catch (error) {
   console.error('Mesaj gönderme hatası:', error);
   setMessages(prev => [
     ...prev, 
     { id: Date.now(), text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', isUser: false, error: true }
   ]);
 } finally {
   setLoading(false);
 }
};

return (
 <div className="flex flex-col h-[70vh] bg-gray-50 rounded-lg shadow-md overflow-hidden">
   <div className="flex-1 overflow-y-auto p-4">
     {messages.map(message => (
       <ChatMessage key={message.id} message={message} />
     ))}
     {loading && (
       <div className="flex items-center my-2">
         <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
         <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
         <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
       </div>
     )}
   </div>
   <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
 </div>
);
}
