import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'ai-quote-assistant-web', timestamp: new Date().toISOString() });
}
