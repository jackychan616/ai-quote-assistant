import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  status: z.enum(['pending', 'done', 'cancelled']).default('done'),
});

export async function PATCH(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) return NextResponse.json({ error: envError }, { status: 500 });

  const json = await request.json().catch(() => null);
  const parsed = bulkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', detail: parsed.error.flatten() }, { status: 422 });
  }

  const payload = parsed.data;
  const patch: Record<string, unknown> = { status: payload.status };
  if (payload.status === 'done') patch.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('followups')
    .update(patch)
    .in('id', payload.ids)
    .select('id,status');

  if (error) {
    return NextResponse.json({ error: 'Failed bulk update', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: data?.length ?? 0, data });
}
