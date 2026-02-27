'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function QuoteDraftPage({ params }: { params: { id: string } }) {
  const [subtotal, setSubtotal] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [currency, setCurrency] = useState('HKD');
  const [aiSummary, setAiSummary] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    const s = Number(subtotal || 0);
    const d = Number(discount || 0);
    const t = Number(tax || 0);
    return Math.max(0, s - d + t).toFixed(2);
  }, [subtotal, discount, tax]);

  async function saveDraft() {
    setLoading(true);
    setMsg('');

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: params.id,
        currency,
        subtotal: Number(subtotal || 0),
        discountAmount: Number(discount || 0),
        taxAmount: Number(tax || 0),
        aiSummary,
      }),
    });

    const body = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMsg(`建立 draft 失敗：${body?.error ?? 'unknown error'}`);
      return;
    }

    setMsg(`Quote draft 已建立 ✅（id: ${body.data?.id ?? 'n/a'}）`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Quote Draft（Lead: {params.id.slice(0, 8)}...）</h1>
      <p className="mt-1 text-slate-600">先做 MVP 計價版，下一版再加 line items + PDF。</p>

      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="Subtotal">
            <input type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Discount">
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="Tax">
            <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </Field>
        </div>

        <Field label="AI Summary / 報價說明">
          <textarea rows={4} value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </Field>

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-800">Total: <strong>{currency} {total}</strong></div>

        <div className="flex gap-3">
          <button disabled={loading} onClick={saveDraft} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white disabled:opacity-60">
            {loading ? '儲存中...' : '建立 Quote Draft'}
          </button>
          <Link href={`/lead/${params.id}`} className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            返回 Lead
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            返回 Dashboard
          </Link>
        </div>
      </div>

      {msg ? <p className="mt-3 text-sm text-slate-700">{msg}</p> : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <p className="mb-1 text-sm text-slate-700">{label}</p>
      {children}
    </label>
  );
}
