// components/ChatMessage.jsx
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const { text, isUser, context, error } = message;
  
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
        <div className="whitespace-pre-wrap">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
        
        {context && context.length > 0 && (
          <div className="mt-2 text-xs opacity-75">
            <p>İlgili stok öğeleri: {context.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
