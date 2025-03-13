import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
try {
 const client = await clientPromise;
 const db = client.db("otelStokDB");
 const inventory = db.collection("inventory");
 
 const items = await inventory.find({}).limit(100).toArray();
 
 return NextResponse.json(items);
} catch (error) {
 console.error('Envanter API Hatası:', error);
 return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
}
}
