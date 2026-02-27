import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'TODO: list quotes with lead join + filters' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'TODO: create quote (+ optional AI summary)' }, { status: 501 });
}
