-- AI Quote + Follow-up Assistant initial schema
-- Enable required extension
create extension if not exists pgcrypto;

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Optional profile table mapped to Supabase Auth users
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'sales' check (role in ('admin','sales','manager')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  source text,
  status text not null default 'new' check (status in ('new','qualified','quoted','won','lost')),
  notes text,
  owner_user_id uuid references public.app_users(id),
  created_by_user_id uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_owner_user_id on public.leads(owner_user_id);

create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  version_no int not null default 1,
  currency text not null default 'TWD',
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  valid_until date,
  ai_summary text,
  created_by_user_id uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotes_lead_id on public.quotes(lead_id);
create index if not exists idx_quotes_status on public.quotes(status);

create trigger trg_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  item_name text not null,
  description text,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_quote_line_items_quote_id on public.quote_line_items(quote_id);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  quote_id uuid references public.quotes(id) on delete set null,
  due_at timestamptz not null,
  channel text not null check (channel in ('email','phone','whatsapp','line','other')),
  status text not null default 'pending' check (status in ('pending','done','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  auto_generated boolean not null default false,
  message_draft text,
  outcome_note text,
  completed_at timestamptz,
  created_by_user_id uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_followups_due_at on public.followups(due_at);
create index if not exists idx_followups_status on public.followups(status);
create index if not exists idx_followups_lead_id on public.followups(lead_id);

create trigger trg_followups_updated_at
before update on public.followups
for each row execute function public.set_updated_at();

-- Basic RLS setup
alter table public.app_users enable row level security;
alter table public.leads enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_line_items enable row level security;
alter table public.followups enable row level security;

-- Starter policies: authenticated users can read/write.
-- Tighten by org/team in future iteration.
create policy if not exists "app_users_authenticated_all"
on public.app_users for all
to authenticated
using (true)
with check (true);

create policy if not exists "leads_authenticated_all"
on public.leads for all
to authenticated
using (true)
with check (true);

create policy if not exists "quotes_authenticated_all"
on public.quotes for all
to authenticated
using (true)
with check (true);

create policy if not exists "quote_line_items_authenticated_all"
on public.quote_line_items for all
to authenticated
using (true)
with check (true);

create policy if not exists "followups_authenticated_all"
on public.followups for all
to authenticated
using (true)
with check (true);
