'use client';

import { useState, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';

export interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  lastMessage: string;
}

interface ChatInterfaceProps {
  conversation: Conversation;
  updateConversation: (conv: Conversation) => void;
}

export default function ChatInterface({ conversation, updateConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation]);

  // Update conversation only when the latest message (lastMessage) changes.
  useEffect(() => {
    const lastMsg = messages.length > 0 ? (messages[messages.length - 1].text || "") : "";
    if (lastMsg !== conversation.lastMessage) {
      updateConversation({ ...conversation, messages, lastMessage: lastMsg });
    }
    // Only depend on messages. Assume conversation and updateConversation are stable.
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { id: Date.now(), text: text || "", isUser: true };
    setMessages(prev => [...prev, newMessage]);

    setLoading(true);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text || "" })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }
      const botMessage: Message = { id: Date.now(), text: data.response || "", isUser: false, context: data.context };
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sohbet</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center my-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
}
