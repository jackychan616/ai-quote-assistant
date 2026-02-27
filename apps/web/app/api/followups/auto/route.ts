import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

// Simple auto scheduler (MVP):
// - Find leads in quoted status
// - If no pending follow-up exists, create one for +1 day
export async function POST() {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { data: quotedLeads, error: leadsError } = await supabaseAdmin
    .from('leads')
    .select('id, full_name, email')
    .eq('status', 'quoted')
    .limit(200);

  if (leadsError) {
    return NextResponse.json({ error: 'Failed to fetch quoted leads', detail: leadsError.message }, { status: 500 });
  }

  let created = 0;

  for (const lead of quotedLeads ?? []) {
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('followups')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('status', 'pending')
      .limit(1);

    if (exErr) continue;
    if ((existing ?? []).length > 0) continue;

    const due = new Date();
    due.setDate(due.getDate() + 1);

    const { error: insertErr } = await supabaseAdmin.from('followups').insert({
      lead_id: lead.id,
      due_at: due.toISOString(),
      channel: 'whatsapp',
      priority: 'medium',
      message_draft: `Hi ${lead.full_name || ''}，想跟進返你之前報價，如果你方便我可以幫你落實下一步。`,
      status: 'pending',
      auto_generated: true,
    });

    if (!insertErr) created += 1;
  }

  return NextResponse.json({ ok: true, created });
}
