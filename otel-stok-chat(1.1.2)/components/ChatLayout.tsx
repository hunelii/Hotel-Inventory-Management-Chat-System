'use client';

import { useState, useEffect } from 'react';
import ChatInterface, { Conversation } from './ChatInterface';

export default function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('conversations');
    if (stored) {
      const convs: Conversation[] = JSON.parse(stored);
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    } else {
      const initialMessage = `Merhaba! Otel stok yönetim sistemi için AI destekli sohbet asistanına hoş geldiniz.
      
Örnek sorular:
- "Stokta ne var?"
- "Norveç Somonu hakkında detaylı bilgi verir misin?"
- "Levrek'in alternatifleri nelerdir?"

Nasıl ilerleyeceğiniz konusunda yardım almak için sorularınızı açık ve detaylı yazabilirsiniz.`;
      const initialConv: Conversation = {
        id: Date.now(),
        title: "Yeni Sohbet",
        messages: [
          {
            id: Date.now(),
            text: initialMessage,
            isUser: false
          }
        ],
        lastMessage: initialMessage
      };
      setConversations([initialConv]);
      setActiveConversationId(initialConv.id);
      localStorage.setItem('conversations', JSON.stringify([initialConv]));
    }
  }, []);

  const updateConversation = (updatedConversation: Conversation) => {
    const updatedConvs = conversations.map(conv =>
      conv.id === updatedConversation.id ? updatedConversation : conv
    );
    setConversations(updatedConvs);
    localStorage.setItem('conversations', JSON.stringify(updatedConvs));
  };

  const handleNewChat = () => {
    const welcomeMessage = `Merhaba! Otel stok yönetim sistemi için AI destekli sohbet asistanına hoş geldiniz.
    
Örnek sorular:
- "Stokta ne var?"
- "Norveç Somonu hakkında detaylı bilgi verir misin?"
- "Levrek'in alternatifleri nelerdir?"

Lütfen sorularınızı açık ve detaylı yazın, böylece size en iyi şekilde yardımcı olabilirim.`;
    const newConv: Conversation = {
      id: Date.now(),
      title: "Yeni Sohbet",
      messages: [
        {
          id: Date.now(),
          text: welcomeMessage,
          isUser: false
        }
      ],
      lastMessage: welcomeMessage
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-700 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Sohbet Geçmişi</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <p className="text-gray-400">Henüz sohbet geçmişi yok.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`p-2 mb-2 rounded cursor-pointer ${
                  conv.id === activeConversationId ? "bg-gray-600" : "bg-gray-700"
                }`}
              >
                <h2 className="font-semibold">{conv.title}</h2>
                <p className="text-sm text-gray-300">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Yeni Sohbet
          </button>
        </div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 p-4">
        {activeConversation ? (
          <ChatInterface conversation={activeConversation} updateConversation={updateConversation} />
        ) : (
          <p className="text-gray-500 dark:text-gray-300">Lütfen bir sohbet seçin veya yeni bir sohbet başlatın.</p>
        )}
      </main>
    </div>
  );
}
