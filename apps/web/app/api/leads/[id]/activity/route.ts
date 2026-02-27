import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const [quotesRes, followupsRes] = await Promise.all([
    supabaseAdmin
      .from('quotes')
      .select('id,status,total_amount,currency,created_at')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('followups')
      .select('id,status,channel,due_at,created_at,completed_at')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (quotesRes.error || followupsRes.error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch activity',
        detail: quotesRes.error?.message || followupsRes.error?.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      quotes: quotesRes.data ?? [],
      followups: followupsRes.data ?? [],
    },
  });
}
