import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'TODO: list leads with pagination + filters' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'TODO: create lead' }, { status: 501 });
}
