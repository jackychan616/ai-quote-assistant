import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST() {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const leadsPayload = [
    {
      full_name: 'Chan Beauty Studio',
      email: 'owner@chanbeauty.hk',
      phone: '+852 6123 4567',
      company: 'Chan Beauty Studio',
      source: 'Instagram',
      status: 'quoted',
      notes: 'Interested in monthly lead follow-up automation',
    },
    {
      full_name: 'BrightMind Tutorial',
      email: 'admin@brightmind.edu.hk',
      phone: '+852 6234 5678',
      company: 'BrightMind Tutorial',
      source: 'Referral',
      status: 'new',
      notes: 'Need faster enquiry response and quote turnaround',
    },
  ];

  const { data: leads, error: leadsError } = await supabaseAdmin.from('leads').insert(leadsPayload).select('*');

  if (leadsError || !leads || leads.length === 0) {
    return NextResponse.json({ error: 'Failed to seed leads', detail: leadsError?.message }, { status: 500 });
  }

  const quotedLead = leads.find((l) => l.status === 'quoted') ?? leads[0];

  const { data: quote, error: quoteError } = await supabaseAdmin
    .from('quotes')
    .insert({
      lead_id: quotedLead.id,
      currency: 'HKD',
      subtotal: 3200,
      discount_amount: 200,
      tax_amount: 0,
      total_amount: 3000,
      status: 'draft',
      ai_summary: 'Monthly follow-up automation package for lead nurturing',
    })
    .select('*')
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: 'Failed to seed quote', detail: quoteError?.message }, { status: 500 });
  }

  await supabaseAdmin.from('quote_line_items').insert([
    {
      quote_id: quote.id,
      item_name: 'Automation Setup',
      description: 'Initial setup + pipeline config',
      quantity: 1,
      unit_price: 1800,
      line_total: 1800,
      sort_order: 0,
    },
    {
      quote_id: quote.id,
      item_name: 'Monthly Follow-up Flow',
      description: 'D+1/D+3 reminder sequence',
      quantity: 1,
      unit_price: 1400,
      line_total: 1400,
      sort_order: 1,
    },
  ]);

  await supabaseAdmin.from('followups').insert({
    lead_id: quotedLead.id,
    quote_id: quote.id,
    due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    channel: 'email',
    status: 'pending',
    priority: 'medium',
    auto_generated: true,
    message_draft: 'Hi! Following up on your quote. Happy to help finalize the setup this week.',
  });

  return NextResponse.json({ ok: true, seeded: { leads: leads.length, quoteId: quote.id } });
}
