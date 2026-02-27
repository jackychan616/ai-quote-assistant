import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '../../../../../lib/supabaseAdmin';

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
  const toEmail = lead?.email ?? '';
  const text =
    row.message_draft?.trim() ||
    `Hi ${lead?.full_name || ''}，想跟進返你之前報價，如果你方便我可以幫你落實下一步。`;

  let mode: 'stub' | 'resend' = 'stub';

  // If channel=email and env is configured, send real email via Resend.
  if (row.channel === 'email' && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && toEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [toEmail],
      subject: 'Follow-up on your quote',
      text,
    });

    if (sendError) {
      return NextResponse.json({ error: 'Failed to send email', detail: sendError.message }, { status: 500 });
    }

    mode = 'resend';
  }

  await supabaseAdmin
    .from('followups')
    .update({ status: 'done', completed_at: new Date().toISOString() })
    .eq('id', params.id);

  return NextResponse.json({
    ok: true,
    sent: { channel: row.channel, to: toEmail || 'unknown', text },
    mode,
  });
}
