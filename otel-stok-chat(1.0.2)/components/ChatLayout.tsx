'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { ChatMessage as ChatMessageType } from '@/lib/sessionStorage';

export default function ChatLayout() {
  const [conversations, setConversations] = useState<{ id: number; title: string; messages: ChatMessageType[]; lastMessage: string }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('conversations');
    if (stored) {
      const convs = JSON.parse(stored);
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    } else {
      const initialConv = {
        id: Date.now(),
        title: "Yeni Sohbet",
        messages: [
          {
            id: Date.now(),
            text: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.',
            isUser: false
          }
        ],
        lastMessage: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.'
      };
      setConversations([initialConv]);
      setActiveConversationId(initialConv.id);
      localStorage.setItem('conversations', JSON.stringify([initialConv]));
    }
  }, []);

  const updateConversation = (updatedConversation: { id: number; title: string; messages: ChatMessageType[]; lastMessage: string }) => {
    const updatedConvs = conversations.map(conv =>
      conv.id === updatedConversation.id ? updatedConversation : conv
    );
    setConversations(updatedConvs);
    localStorage.setItem('conversations', JSON.stringify(updatedConvs));
  };

  const handleNewChat = () => {
    const newConv = {
      id: Date.now(),
      title: "Yeni Sohbet",
      messages: [
        {
          id: Date.now(),
          text: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.',
          isUser: false
        }
      ],
      lastMessage: 'Merhaba! Otel stok sistemi hakkında sorularınızı yanıtlamak için buradayım.'
    };
    const updatedConvs = [newConv, ...conversations];
    setConversations(updatedConvs);
    setActiveConversationId(newConv.id);
    localStorage.setItem('conversations', JSON.stringify(updatedConvs));
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-500 text-white p-4">Chat Application</header>
      <main className="flex-1 bg-gray-100 p-4">
        {activeConversation ? (
          <ChatInterface
            conversation={activeConversation}
            updateConversation={(conv) => updateConversation({ ...activeConversation, ...conv })}
          />
        ) : (
          <p className="text-gray-500">Lütfen bir sohbet seçin veya yeni bir sohbet başlatın.</p>
        )}
      </main>
    </div>
  );
}
