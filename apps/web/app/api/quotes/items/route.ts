import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('leadId');
  if (!leadId) {
    return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
  }

  const { data: quote, error: quoteErr } = await supabaseAdmin
    .from('quotes')
    .select('id')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (quoteErr || !quote) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabaseAdmin
    .from('quote_line_items')
    .select('*')
    .eq('quote_id', quote.id)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quote items', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
