import Link from 'next/link';
import { ConversionFunnel } from '../../components/charts/ConversionFunnel';
import { DailyLeadsChart } from '../../components/charts/DailyLeadsChart';
import { EmptyState } from '../../components/ui/EmptyState';

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

async function getLeads({ status, q, pageSize = 50 }: { status?: string; q?: string; pageSize?: number }): Promise<Lead[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ page: '1', pageSize: String(pageSize) });
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

function getDailyLeads(leads: Lead[], days = 7) {
  const today = new Date();
  const points = [] as { label: string; value: number }[];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const value = leads.filter((lead) => lead.created_at.slice(0, 10) === key).length;
    points.push({
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      value,
    });
  }

  return points;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status ?? 'all';
  const q = searchParams.q ?? '';

  const [filteredLeads, allLeads, pendingFollowups] = await Promise.all([
    getLeads({ status, q, pageSize: 50 }),
    getLeads({ pageSize: 500 }),
    getPendingFollowups(),
  ]);

  const counts = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new').length,
    qualified: allLeads.filter((l) => l.status === 'qualified').length,
    quoted: allLeads.filter((l) => l.status === 'quoted').length,
    won: allLeads.filter((l) => l.status === 'won').length,
  };

  const conversion = counts.quoted > 0 ? Math.round((counts.won / counts.quoted) * 100) : 0;
  const dailyLeads = getDailyLeads(allLeads, 7);
  const hasAnyLeads = allLeads.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Pipeline 一眼睇曬：轉換漏斗 + 每日新增 lead。</p>
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
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
        />
        <select name="status" defaultValue={status} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">顯示最近 50 筆名單</div>
      </form>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi title="Leads（全部）" value={counts.total} />
        <Kpi title="New" value={counts.new} />
        <Kpi title="Qualified" value={counts.qualified} />
        <Kpi title="Won" value={counts.won} />
        <Kpi title="Pending Follow-ups" value={pendingFollowups} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-slate-900">Conversion Funnel</h2>
              <p className="text-sm text-slate-600">由新 lead 到成交嘅轉換狀態</p>
            </div>
            <p className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Won / Quoted: {conversion}%</p>
          </div>
          {hasAnyLeads ? (
            <ConversionFunnel
              stages={[
                { label: 'New', value: counts.new, colorClass: 'bg-indigo-300' },
                { label: 'Qualified', value: counts.qualified, colorClass: 'bg-indigo-400' },
                { label: 'Quoted', value: counts.quoted, colorClass: 'bg-indigo-500' },
                { label: 'Won', value: counts.won, colorClass: 'bg-emerald-500' },
              ]}
            />
          ) : (
            <EmptyState
              title="未有 pipeline 數據"
              description="新增第一個 lead 後，呢度會自動顯示轉換漏斗，幫你追蹤各階段表現。"
              actionHref="/lead/new"
              actionLabel="新增第一個 Lead"
            />
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-base font-medium text-slate-900">Daily New Leads</h2>
            <p className="text-sm text-slate-600">最近 7 日新增 lead 走勢</p>
          </div>
          {hasAnyLeads ? (
            <DailyLeadsChart points={dailyLeads} />
          ) : (
            <EmptyState
              title="仲未有每日走勢"
              description="當你開始建立名單後，系統會按日彙整新增 lead 數量。"
              actionHref="/lead/new"
              actionLabel="開始建立名單"
            />
          )}
        </div>
      </section>

      <section className="mt-8 card p-4">
        <h2 className="text-lg font-medium text-slate-900">Lead List</h2>
        {filteredLeads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">未搵到資料。試下清空篩選，或者新增第一個 lead。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {filteredLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{lead.full_name}</p>
                  <p className="text-sm text-slate-600">
                    {lead.email}
                    {lead.company ? ` · ${lead.company}` : ''}
                  </p>
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

