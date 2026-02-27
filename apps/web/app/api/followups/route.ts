import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const createFollowupSchema = z.object({
  leadId: z.string().uuid(),
  quoteId: z.string().uuid().optional(),
  dueAt: z.string().datetime(),
  channel: z.enum(['email', 'phone', 'whatsapp', 'line', 'other']).default('email'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  messageDraft: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('followups')
    .select('*, leads(full_name,email), quotes(id,total_amount,currency)')
    .order('due_at', { ascending: true })
    .limit(100);

  if (status && ['pending', 'done', 'cancelled'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch followups', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const json = await request.json().catch(() => null);
  const parsed = createFollowupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', detail: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const { data, error } = await supabaseAdmin
    .from('followups')
    .insert({
      lead_id: payload.leadId,
      quote_id: payload.quoteId ?? null,
      due_at: payload.dueAt,
      channel: payload.channel,
      priority: payload.priority,
      message_draft: payload.messageDraft ?? null,
      status: 'pending',
      auto_generated: false,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create followup', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
