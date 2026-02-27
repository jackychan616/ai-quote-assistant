import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin';

// MVP send stub:
// - marks follow-up as done
// - returns the outbound payload preview
// Later: plug into Resend / WhatsApp provider
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { data: row, error } = await supabaseAdmin
    .from('followups')
    .select('id, channel, message_draft, leads(full_name,email)')
    .eq('id', params.id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: 'Follow-up not found', detail: error?.message }, { status: 404 });
  }

  const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
  const outbound = {
    channel: row.channel,
    to: lead?.email ?? 'unknown',
    text:
      row.message_draft?.trim() ||
      `Hi ${lead?.full_name || ''}，想跟進返你之前報價，如果你方便我可以幫你落實下一步。`,
  };

  await supabaseAdmin
    .from('followups')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({ ok: true, sent: outbound, mode: 'stub' });
}
