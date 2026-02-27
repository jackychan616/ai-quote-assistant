import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

const createLeadSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  source: z.string().max(80).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['new', 'qualified', 'quoted', 'won', 'lost']).optional(),
});

export async function GET(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: envError }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Math.min(Number(searchParams.get('pageSize') ?? '20'), 100);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.trim();

  const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
  const to = from + Math.max(pageSize, 1) - 1;

  let query = supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status && ['new', 'qualified', 'quoted', 'won', 'lost'].includes(status)) {
    query = query.eq('status', status);
  }

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch leads', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: {
      page,
      pageSize,
      total: count ?? 0,
    },
  });
}

export async function POST(request: NextRequest) {
  const { client: supabaseAdmin, error: envError } = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: envError }, { status: 500 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', detail: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const payload = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone ?? null,
      company: payload.company ?? null,
      source: payload.source ?? null,
      notes: payload.notes ?? null,
      status: payload.status ?? 'new',
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create lead', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
