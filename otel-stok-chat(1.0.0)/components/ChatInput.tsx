import { useState } from 'react';

interface ChatInputProps {
onSendMessage: (text: string) => void;
disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
const [input, setInput] = useState('');

const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (input.trim() && !disabled) {
   onSendMessage(input);
   setInput('');
 }
};

return (
 <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
   <div className="flex">
     <input
       type="text"
       value={input}
       onChange={(e) => setInput(e.target.value)}
       disabled={disabled}
       placeholder="Stok sistemi hakkında bir soru sorun..."
       className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
     />
     <button
       type="submit"
       disabled={disabled || !input.trim()}
       className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
     >
       Gönder
     </button>
   </div>
 </form>
);
}
