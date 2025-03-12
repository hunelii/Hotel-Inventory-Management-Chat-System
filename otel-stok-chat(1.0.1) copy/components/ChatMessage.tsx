import React from 'react';

export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  context?: unknown[];
  error?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { text, isUser, context, error } = message;
  const safeText = text || "";

  return (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
          isUser
            ? 'bg-blue-500 text-white'
            : error
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{safeText}</p>
        {context && context.length > 0 && (
          <div className="mt-2 text-xs opacity-75">
            <p>İlgili stok öğeleri: {context.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
