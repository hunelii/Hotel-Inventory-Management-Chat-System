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
  // editingMessageId and editingText can be implemented later if you need full editing support
  // For now, if they're not used, you may remove them or comment them out.
  // const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  // const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation]);

  useEffect(() => {
    const lastMsg = messages.length > 0 ? (messages[messages.length - 1].text || "") : "";
    updateConversation({ ...conversation, messages, lastMessage: lastMsg });
  }, [messages, conversation, updateConversation]);

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
        throw new Error(data.error || 'An error occurred');
      }
      const botMessage: Message = { id: Date.now(), text: data.response || "", isUser: false, context: data.context };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: 'Sorry, an error occurred. Please try again.', isUser: false, error: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Sohbet</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
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
