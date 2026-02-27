import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

const updateLeadSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(40).nullable().optional(),
  company: z.string().max(120).nullable().optional(),
  source: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  status: z.enum(['new', 'qualified', 'quoted', 'won', 'lost']).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const { data, error } = await supabaseAdmin.from('leads').select('*').eq('id', params.id).single();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch lead', detail: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const json = await request.json().catch(() => null);
  const parsed = updateLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', detail: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const updateRow: Record<string, unknown> = {};

  if (payload.fullName !== undefined) updateRow.full_name = payload.fullName;
  if (payload.email !== undefined) updateRow.email = payload.email;
  if (payload.phone !== undefined) updateRow.phone = payload.phone;
  if (payload.company !== undefined) updateRow.company = payload.company;
  if (payload.source !== undefined) updateRow.source = payload.source;
  if (payload.notes !== undefined) updateRow.notes = payload.notes;
  if (payload.status !== undefined) updateRow.status = payload.status;

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(updateRow)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update lead', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
