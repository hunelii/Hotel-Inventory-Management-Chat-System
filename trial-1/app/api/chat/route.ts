import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import clientPromise from "@/lib/db";
import type { InventoryItem } from "@/lib/types";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const client = await clientPromise;
    const db = client.db("your_database_name");
    const collection = db.collection<InventoryItem>("inventory");

    // Fetch relevant data from MongoDB
    const inventory = await collection.find({}).toArray();

    // Call OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Given the inventory data: ${JSON.stringify(inventory)}, answer the following question: ${message}`,
      max_tokens: 150,
    });

    const aiMessage = response.data.choices[0].text.trim();

    return NextResponse.json({
      message: aiMessage,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyiniz." },
      { status: 500 }
    );
  }
}