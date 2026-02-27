import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'ai-quote-assistant-web',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasSupabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
    },
  });
}
