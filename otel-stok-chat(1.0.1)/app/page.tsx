import ChatInterface from '@/components/ChatInterface';

export default function Home() {
return (
 <main className="min-h-screen p-4 md:p-8">
   <div className="max-w-4xl mx-auto">
     <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
       Otel Stok Yönetim Sistemi
     </h1>
     <ChatInterface />
   </div>
 </main>
);
}
