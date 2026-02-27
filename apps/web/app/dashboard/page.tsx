import Link from 'next/link';

type Lead = {
  id: string;
  full_name: string;
  email: string;
  company?: string;
  status: 'new' | 'qualified' | 'quoted' | 'won' | 'lost';
  created_at: string;
};

type Followup = {
  id: string;
  status: 'pending' | 'done' | 'cancelled';
};

async function getLeads(status?: string, q?: string): Promise<Lead[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ page: '1', pageSize: '50' });
  if (status && status !== 'all') params.set('status', status);
  if (q) params.set('q', q);

  const res = await fetch(`${baseUrl}/api/leads?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const body = await res.json();
  return body.data ?? [];
}

async function getPendingFollowups(): Promise<number> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/followups?status=pending`, { cache: 'no-store' });
  if (!res.ok) return 0;
  const body = await res.json();
  const rows: Followup[] = body.data ?? [];
  return rows.length;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status ?? 'all';
  const q = searchParams.q ?? '';
  const [leads, pendingFollowups] = await Promise.all([getLeads(status, q), getPendingFollowups()]);

  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    quoted: leads.filter((l) => l.status === 'quoted').length,
    won: leads.filter((l) => l.status === 'won').length,
  };

  const conversion = counts.quoted > 0 ? Math.round((counts.won / counts.quoted) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">今日重點：先處理新 lead，再推進已報價客戶。</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" href="/quotes">
            Quote List
          </Link>
          <Link className="btn-secondary" href="/followups">
            Follow-ups
          </Link>
          <Link className="btn-primary" href="/lead/new">
            + 新增 Lead
          </Link>
        </div>
      </div>

      <form className="card mt-5 grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜尋姓名 / email / 公司"
          className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2"
        />
        <select name="status" defaultValue={status} className="rounded-xl border border-slate-300 px-3 py-2">
          <option value="all">全部狀態</option>
          <option value="new">new</option>
          <option value="qualified">qualified</option>
          <option value="quoted">quoted</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
        </select>
        <button type="submit" className="btn-secondary">
          套用篩選
        </button>
      </form>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi title="Leads（結果）" value={counts.total} />
        <Kpi title="New" value={counts.new} />
        <Kpi title="Quoted" value={counts.quoted} />
        <Kpi title="Won" value={counts.won} />
        <Kpi title="Pending Follow-ups" value={pendingFollowups} />
      </section>

      <section className="mt-4 card p-4">
        <h2 className="text-sm text-slate-600">Conversion Snapshot</h2>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{conversion}%</p>
        <p className="text-sm text-slate-600">Won / Quoted（簡易版）</p>
      </section>

      <section className="mt-8 card p-4">
        <h2 className="text-lg font-medium text-slate-900">Lead List</h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">未搵到資料。試下清空篩選，或者新增第一個 lead。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {leads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{lead.full_name}</p>
                  <p className="text-sm text-slate-600">{lead.email}{lead.company ? ` · ${lead.company}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{lead.status}</span>
                  <Link href={`/lead/${lead.id}`} className="btn-secondary !px-2.5 !py-1 !text-xs">
                    查看/編輯
                  </Link>
                  <Link href={`/quote/${lead.id}`} className="btn-primary !px-2.5 !py-1 !text-xs">
                    Quote Draft
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
