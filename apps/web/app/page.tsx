import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            AI Quote + Follow-up Assistant
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            由查詢到成交，一站式自動化。
          </h1>
          <p className="mt-4 text-slate-600">
            專為香港中小企而設：快速出報價、追蹤客戶狀態、自動提醒跟進，減少漏單，提升成交率。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">
              立即開始
            </Link>
            <Link href="/lead/new" className="btn-secondary">
              新增第一個 Lead
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-medium text-slate-900">你會得到咩？</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>• Lead 管理（搜尋 / 篩選 / 編輯）</li>
            <li>• Quote Draft（多項目計價）</li>
            <li>• Follow-up 排程與待辦管理</li>
            <li>• Dashboard KPI 睇清楚 pipeline</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
