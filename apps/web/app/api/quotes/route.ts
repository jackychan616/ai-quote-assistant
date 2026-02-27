import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const createQuoteSchema = z.object({
  leadId: z.string().uuid(),
  currency: z.string().min(3).max(10).optional(),
  subtotal: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  aiSummary: z.string().max(5000).optional(),
});

export async function GET(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('leadId');

  let query = supabaseAdmin.from('quotes').select('*').order('created_at', { ascending: false }).limit(30);
  if (leadId) query = query.eq('lead_id', leadId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const json = await request.json().catch(() => null);
  const parsed = createQuoteSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', detail: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const totalAmount = payload.subtotal - payload.discountAmount + payload.taxAmount;

  const { data, error } = await supabaseAdmin
    .from('quotes')
    .insert({
      lead_id: payload.leadId,
      currency: payload.currency ?? 'HKD',
      subtotal: payload.subtotal,
      discount_amount: payload.discountAmount,
      tax_amount: payload.taxAmount,
      total_amount: totalAmount,
      ai_summary: payload.aiSummary ?? null,
      status: 'draft',
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create quote', detail: error.message }, { status: 500 });
  }

  await supabaseAdmin.from('leads').update({ status: 'quoted' }).eq('id', payload.leadId);

  return NextResponse.json({ data }, { status: 201 });
}
