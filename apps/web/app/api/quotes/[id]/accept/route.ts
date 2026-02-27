import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { data: quote, error: quoteErr } = await supabaseAdmin
    .from('quotes')
    .select('id,lead_id,status')
    .eq('id', params.id)
    .single();

  if (quoteErr || !quote) {
    return NextResponse.json({ error: 'Quote not found', detail: quoteErr?.message }, { status: 404 });
  }

  const { error: updErr } = await supabaseAdmin
    .from('quotes')
    .update({ status: 'accepted' })
    .eq('id', params.id);

  if (updErr) {
    return NextResponse.json({ error: 'Failed to accept quote', detail: updErr.message }, { status: 500 });
  }

  await supabaseAdmin.from('leads').update({ status: 'won' }).eq('id', quote.lead_id);

  return NextResponse.json({ ok: true, quoteId: params.id, leadId: quote.lead_id, status: 'accepted' });
}
