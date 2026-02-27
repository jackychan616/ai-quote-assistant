'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type CreateLeadPayload = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
};

export default function NewLeadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const payload: CreateLeadPayload = {
      fullName: String(form.get('fullName') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || '') || undefined,
      company: String(form.get('company') || '') || undefined,
      source: String(form.get('source') || '') || undefined,
      notes: String(form.get('notes') || '') || undefined,
    };

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage('新增失敗，請檢查欄位後再試。');
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setMessage('Lead 已新增 ✅ 你可以去 Dashboard 睇到。');
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">新增 Lead</h1>
        <p className="mt-1 text-slate-600">填最基本資料，提交後可去 Dashboard 見到。</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">客戶名稱 *</label>
            <input name="fullName" required className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Email *</label>
            <input type="email" name="email" required className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">電話</label>
            <input name="phone" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">公司</label>
            <input name="company" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">來源</label>
          <input name="source" placeholder="IG / WhatsApp / Referral" className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">備註</label>
          <textarea name="notes" rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={loading} type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white disabled:opacity-60">
            {loading ? '儲存中...' : '儲存 Lead'}
          </button>
          <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">返回 Dashboard</Link>
        </div>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
      <p className="mt-2 text-xs text-slate-500">註：目前係 MVP，下一步會加 toast、錯誤細節同編輯頁。</p>
    </main>
  );
}
