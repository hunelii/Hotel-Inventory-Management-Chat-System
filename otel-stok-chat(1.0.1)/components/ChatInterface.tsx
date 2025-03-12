'use client';

import { useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatInterfaceProps {
  conversation: any;
  updateConversation: (conv: any) => void;
}

export default function ChatInterface({ conversation, updateConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Konuşma değiştiğinde mesajları güncelle
  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation]);

  // Mesajlar her değiştiğinde, güncellenmiş konuşmayı üst bileşene bildir
  useEffect(() => {
    const lastMsg = messages.length > 0 ? messages[messages.length - 1].text : "";
    updateConversation({ ...conversation, messages, lastMessage: lastMsg });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessage = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, newMessage]);

    setLoading(true);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }
      const botMessage = { id: Date.now(), text: data.response, isUser: false, context: data.context };
      setMessages(prev => [...prev, botMessage]);
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

  // Kullanıcının düzenlediği mesajı güncelle ve buna bağlı olarak bot cevabını yeniden sorgula
  const handleEditMessage = async (id: number, newText: string) => {
    // İlk olarak, düzenlenen mesajın metnini güncelliyoruz
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, text: newText } : msg))
    );
    setEditingMessageId(null);
    setEditingText("");

    // Eğer düzenlenen mesaj kullanıcıya aitse, bu mesajın yanıtını yeniden almak için API'ye sorgu gönderiyoruz.
    const index = messages.findIndex(msg => msg.id === id);
    if (index !== -1 && messages[index].isUser) {
      setLoading(true);
      try {
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: newText })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Bir hata oluştu');
        }
        const newBotMessage = { id: Date.now(), text: data.response, isUser: false, context: data.context };

        // Eğer düzenlenen mesajın hemen sonrasında bot cevabı varsa, onu güncelle; yoksa yeni cevap ekle.
        setMessages(prev => {
          const updatedMessages = [...prev];
          if (index + 1 < updatedMessages.length && !updatedMessages[index + 1].isUser) {
            updatedMessages[index + 1] = newBotMessage;
          } else {
            updatedMessages.push(newBotMessage);
          }
          return updatedMessages;
        });
      } catch (error) {
        console.error('Yeni cevap alınırken hata:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Sohbet</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            onDoubleClick={() => {
              if (message.isUser) {
                setEditingMessageId(message.id);
                setEditingText(message.text);
              }
            }}
          >
            {editingMessageId === message.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => handleEditMessage(message.id, editingText)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditMessage(message.id, editingText);
                  }
                }}
                className="border p-1 rounded w-full mb-2"
                autoFocus
              />
            ) : (
              <ChatMessage message={message} />
            )}
          </div>
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
