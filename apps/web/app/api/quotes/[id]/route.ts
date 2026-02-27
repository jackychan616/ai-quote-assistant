import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { data: quote, error: quoteErr } = await supabaseAdmin
    .from('quotes')
    .select('*, leads(full_name,email)')
    .eq('id', params.id)
    .single();

  if (quoteErr || !quote) {
    return NextResponse.json({ error: 'Quote not found', detail: quoteErr?.message }, { status: 404 });
  }

  const { data: items, error: itemsErr } = await supabaseAdmin
    .from('quote_line_items')
    .select('*')
    .eq('quote_id', params.id)
    .order('sort_order', { ascending: true });

  if (itemsErr) {
    return NextResponse.json({ error: 'Failed to fetch quote items', detail: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ data: { quote, items: items ?? [] } });
}
