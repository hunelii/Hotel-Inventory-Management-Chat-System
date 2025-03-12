import React from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/sessionStorage';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { text, isUser, context, error } = message;

  return (
    <div className={`message ${isUser ? 'user' : 'bot'} ${error ? 'error' : ''}`}>
      <p>{text}</p>
      {context && <pre>{JSON.stringify(context, null, 2)}</pre>}
    </div>
  );
}
