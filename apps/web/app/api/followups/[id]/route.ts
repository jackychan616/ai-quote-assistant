import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

const patchSchema = z.object({
  status: z.enum(['pending', 'done', 'cancelled']).optional(),
  outcomeNote: z.string().max(2000).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', detail: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const updateRow: Record<string, unknown> = {};
  if (payload.status !== undefined) updateRow.status = payload.status;
  if (payload.outcomeNote !== undefined) updateRow.outcome_note = payload.outcomeNote;
  if (payload.status === 'done') updateRow.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('followups')
    .update(updateRow)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update followup', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
