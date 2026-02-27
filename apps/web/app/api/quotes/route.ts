import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const lineItemSchema = z.object({
  itemName: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const createQuoteSchema = z.object({
  leadId: z.string().uuid(),
  currency: z.string().min(3).max(10).optional(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  aiSummary: z.string().max(5000).optional(),
  items: z.array(lineItemSchema).min(1),
});

export async function GET(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('leadId');

  let query = supabaseAdmin
    .from('quotes')
    .select('*, leads(full_name,email)')
    .order('created_at', { ascending: false })
    .limit(30);

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
  const subtotal = payload.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = Math.max(0, subtotal - payload.discountAmount + payload.taxAmount);

  const { data: quote, error: quoteError } = await supabaseAdmin
    .from('quotes')
    .insert({
      lead_id: payload.leadId,
      currency: payload.currency ?? 'HKD',
      subtotal,
      discount_amount: payload.discountAmount,
      tax_amount: payload.taxAmount,
      total_amount: totalAmount,
      ai_summary: payload.aiSummary ?? null,
      status: 'draft',
    })
    .select('*')
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Failed to create quote', detail: quoteError?.message }, { status: 500 });
  }

  const rows = payload.items.map((item, index) => ({
    quote_id: quote.id,
    item_name: item.itemName,
    description: item.description ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.quantity * item.unitPrice,
    sort_order: index,
  }));

  const { error: itemsError } = await supabaseAdmin.from('quote_line_items').insert(rows);

  if (itemsError) {
    await supabaseAdmin.from('quotes').delete().eq('id', quote.id);
    return NextResponse.json({ error: 'Failed to create quote items', detail: itemsError.message }, { status: 500 });
  }

  await supabaseAdmin.from('leads').update({ status: 'quoted' }).eq('id', payload.leadId);

  return NextResponse.json({ data: quote }, { status: 201 });
}
