import { NextResponse } from "next/server";
import type { InventoryItem } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Placeholder for MongoDB query
    const inventory: InventoryItem[] = [];

    // Placeholder response until OpenAI integration
    return NextResponse.json({
      message: "API entegrasyonu bekleniyor. Mesajınız alındı: " + message,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
      { status: 500 }
    );
  }
}