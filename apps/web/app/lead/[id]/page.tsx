'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  notes?: string | null;
  status: 'new' | 'qualified' | 'quoted' | 'won' | 'lost';
};

type Activity = {
  quotes: Array<{ id: string; status: string; total_amount: number; currency: string; created_at: string }>;
  followups: Array<{ id: string; status: string; channel: string; due_at: string; created_at: string; completed_at?: string | null }>;
};

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activity, setActivity] = useState<Activity>({ quotes: [], followups: [] });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([fetch(`/api/leads/${params.id}`), fetch(`/api/leads/${params.id}/activity`)])
      .then(async ([leadRes, activityRes]) => {
        const leadBody = await leadRes.json().catch(() => ({}));
        const activityBody = await activityRes.json().catch(() => ({}));
        setLead(leadBody.data ?? null);
        setActivity(activityBody.data ?? { quotes: [], followups: [] });
      })
      .catch(() => {
        setLead(null);
        setActivity({ quotes: [], followups: [] });
      });
  }, [params.id]);

  async function save() {
    if (!lead) return;
    setLoading(true);
    setMsg('');

    const payload = {
      fullName: lead.full_name,
      email: lead.email,
      phone: lead.phone || null,
      company: lead.company || null,
      source: lead.source || null,
      notes: lead.notes || null,
      status: lead.status,
    };

    const res = await fetch(`/api/leads/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    setMsg(res.ok ? '已儲存更新 ✅' : '儲存失敗，請再試。');
  }

  if (!lead) {
    return <main className="mx-auto max-w-3xl px-6 py-10">載入中...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Lead 詳細 / 編輯</h1>

      <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Field label="客戶名稱">
          <input
            value={lead.full_name}
            onChange={(e) => setLead({ ...lead, full_name: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="Email">
          <input
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="電話">
            <input
              value={lead.phone ?? ''}
              onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
          <Field label="公司">
            <input
              value={lead.company ?? ''}
              onChange={(e) => setLead({ ...lead, company: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>
        </div>

        <Field label="來源">
          <input
            value={lead.source ?? ''}
            onChange={(e) => setLead({ ...lead, source: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </Field>

        <Field label="狀態">
          <select
            value={lead.status}
            onChange={(e) => setLead({ ...lead, status: e.target.value as Lead['status'] })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="new">new</option>
            <option value="qualified">qualified</option>
            <option value="quoted">quoted</option>
            <option value="won">won</option>
            <option value="lost">lost</option>
          </select>
        </Field>

        <Field label="備註">
          <textarea
            rows={4}
            value={lead.notes ?? ''}
            onChange={(e) => setLead({ ...lead, notes: e.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </Field>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={loading} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white disabled:opacity-60">
            {loading ? '儲存中...' : '儲存修改'}
          </button>
          <Link href={`/quote/${lead.id}`} className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            去 Quote Draft
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700">
            返回 Dashboard
          </Link>
        </div>
      </div>

      <section className="card mt-5 p-5">
        <h2 className="text-lg font-medium text-slate-900">Activity Timeline</h2>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-slate-700">Quotes</h3>
            {activity.quotes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">未有 quote 記錄。</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {activity.quotes.map((q) => (
                  <li key={q.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-800">{q.currency} {Number(q.total_amount).toFixed(2)} · {q.status}</p>
                    <p className="text-slate-500">{new Date(q.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700">Follow-ups</h3>
            {activity.followups.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">未有 follow-up 記錄。</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {activity.followups.map((f) => (
                  <li key={f.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <p className="font-medium text-slate-800">{f.channel} · {f.status}</p>
                    <p className="text-slate-500">Due: {new Date(f.due_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

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
