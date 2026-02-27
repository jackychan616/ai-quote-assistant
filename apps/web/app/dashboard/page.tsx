type Lead = {
  id: string;
  full_name: string;
  email: string;
  status: 'new' | 'qualified' | 'quoted' | 'won' | 'lost';
  created_at: string;
};

async function getLeads(): Promise<Lead[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/leads?page=1&pageSize=8`, { cache: 'no-store' });
  if (!res.ok) return [];
  const body = await res.json();
  return body.data ?? [];
}

export default async function DashboardPage() {
  const leads = await getLeads();
  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    quoted: leads.filter((l) => l.status === 'quoted').length,
    won: leads.filter((l) => l.status === 'won').length,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-600">今日重點：先處理新 lead，再推進已報價客戶。</p>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Leads (最新8筆)" value={counts.total} />
        <Kpi title="New" value={counts.new} />
        <Kpi title="Quoted" value={counts.quoted} />
        <Kpi title="Won" value={counts.won} />
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Recent Leads</h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">未有資料。先去 /lead/new 新增第一個 lead。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {leads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{lead.full_name}</p>
                  <p className="text-sm text-slate-600">{lead.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{lead.status}</span>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
