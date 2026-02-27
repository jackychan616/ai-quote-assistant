'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type LineItem = {
  itemName: string;
  quantity: number;
  unitPrice: number;
};

export default function QuoteDraftPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<LineItem[]>([{ itemName: 'Service Fee', quantity: 1, unitPrice: 1000 }]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [currency, setCurrency] = useState('HKD');
  const [aiSummary, setAiSummary] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0), [items]);

  const total = useMemo(() => {
    const d = Number(discount || 0);
    const t = Number(tax || 0);
    return Math.max(0, subtotal - d + t).toFixed(2);
  }, [subtotal, discount, tax]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { itemName: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveDraft() {
    setLoading(true);
    setMsg('');

    const payload = {
      leadId: params.id,
      currency,
      discountAmount: Number(discount || 0),
      taxAmount: Number(tax || 0),
      aiSummary,
      items: items.filter((i) => i.itemName.trim().length > 0),
    };

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Quote Draft（Lead: {params.id.slice(0, 8)}...）</h1>
      <p className="mt-1 text-slate-600">已升級：支援 line items（多項目報價）</p>

      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Currency">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Line Items</p>
            <button onClick={addItem} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700">+ Add Item</button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 rounded-xl border border-slate-200 p-2">
                <input
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, { itemName: e.target.value })}
                  className="col-span-6 rounded-lg border border-slate-300 px-2 py-1.5"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value || 0) })}
                  className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5"
                />
                <input
                  type="number"
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value || 0) })}
                  className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5"
                />
                <button onClick={() => removeItem(index)} className="col-span-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-600">
                  ✕
                </button>
              </div>
            ))}
          </div>
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

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-800">
          Subtotal: <strong>{currency} {subtotal.toFixed(2)}</strong> · Total: <strong>{currency} {total}</strong>
        </div>

        <div className="flex gap-3">
          <button disabled={loading} onClick={saveDraft} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white disabled:opacity-60">
            {loading ? '儲存中...' : '建立 Quote Draft'}
          </button>
          <Link href={`/lead/${params.id}`} className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            返回 Lead
          </Link>
          <Link href={`/quote/${params.id}/print`} className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            Print / PDF
          </Link>
          <Link href="/quotes" className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            看 Quote List
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
