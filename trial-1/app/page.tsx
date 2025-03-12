"use client";

import { useState } from "react";
import { MessagesSquare, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/types";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <MessagesSquare className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Otel Stok Yönetim Asistanı</h1>
        </div>

        <Card className="bg-white dark:bg-gray-900 shadow-xl">
          <ScrollArea className="h-[600px] p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <p>Stok yönetimi hakkında sorularınızı sorabilirsiniz.</p>
                  <p className="text-sm mt-2">Örnek: "Balık stoğumuz nedir?" veya "Alternatif içecekler nelerdir?"</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString("tr-TR")}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stok hakkında soru sorun..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gönder"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}