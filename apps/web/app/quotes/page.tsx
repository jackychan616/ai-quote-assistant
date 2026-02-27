import Link from 'next/link';

type Quote = {
  id: string;
  lead_id: string;
  currency: string;
  total_amount: number;
  status: string;
  created_at: string;
  leads?: { full_name?: string; email?: string };
};

async function getQuotes(): Promise<Quote[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/quotes`, { cache: 'no-store' });
  if (!res.ok) return [];
  const body = await res.json();
  return body.data ?? [];
}

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Quote List</h1>
        <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700">返回 Dashboard</Link>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {quotes.length === 0 ? (
          <p className="text-sm text-slate-600">未有 quote。去 lead 詳細頁建立第一份。</p>
        ) : (
          <ul className="space-y-2">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{q.leads?.full_name || q.lead_id.slice(0, 8)}</p>
                  <p className="text-sm text-slate-600">{q.leads?.email || 'no email'} · {new Date(q.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="font-semibold text-slate-900">{q.currency} {Number(q.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-slate-600">{q.status}</p>
                  </div>
                  <Link href={`/quote/view/${q.id}`} className="btn-secondary !px-2.5 !py-1.5 !text-xs">分享頁</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
