import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { client: null, error: 'Missing Supabase env. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY' } as const;
  }

  return {
    client: createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    }),
    error: null,
  } as const;
}
