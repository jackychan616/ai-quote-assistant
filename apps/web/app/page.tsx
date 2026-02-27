import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">AI Quote + Follow-up Assistant</h1>
      <p className="mt-3 text-slate-600">
        MVP 已啟動。你可以先用 Lead 管理同 Dashboard，之後再加 Quote 生成同自動 Follow-up。
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white" href="/dashboard">
          去 Dashboard
        </Link>
        <Link className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700" href="/lead/new">
          新增 Lead
        </Link>
      </div>
    </main>
  );
}
