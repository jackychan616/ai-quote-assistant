import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'TODO: list follow-up tasks' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'TODO: create follow-up task (manual or AI)' }, { status: 501 });
}
