'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Lead = { id: string; full_name: string; email: string };
type Followup = {
  id: string;
  due_at: string;
  channel: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'done' | 'cancelled';
  message_draft?: string;
  leads?: { full_name?: string; email?: string };
};

export default function FollowupsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [leadId, setLeadId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [messageDraft, setMessageDraft] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const [leadsRes, followupsRes] = await Promise.all([
      fetch('/api/leads?page=1&pageSize=100'),
      fetch('/api/followups?status=pending'),
    ]);

    const leadsBody = await leadsRes.json().catch(() => ({}));
    const followupsBody = await followupsRes.json().catch(() => ({}));

    setLeads(leadsBody.data ?? []);
    setFollowups(followupsBody.data ?? []);
    if (!leadId && (leadsBody.data ?? []).length > 0) setLeadId(leadsBody.data[0].id);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createFollowup() {
    setMsg('');
    const iso = new Date(dueAt).toISOString();
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, dueAt: iso, channel, priority, messageDraft }),
    });

    if (!res.ok) {
      setMsg('建立 follow-up 失敗');
      return;
    }

    setMsg('Follow-up 已建立 ✅');
    setMessageDraft('');
    await load();
  }

  async function markDone(id: string) {
    await fetch(`/api/followups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Follow-ups</h1>
        <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700">返回 Dashboard</Link>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">新增 Follow-up</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>
            ))}
          </select>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2" />
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
            <option value="whatsapp">whatsapp</option>
            <option value="email">email</option>
            <option value="phone">phone</option>
            <option value="line">line</option>
            <option value="other">other</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="rounded-xl border border-slate-300 px-3 py-2">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>

        <textarea
          value={messageDraft}
          onChange={(e) => setMessageDraft(e.target.value)}
          rows={3}
          placeholder="跟進訊息草稿"
          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
        />

        <button onClick={createFollowup} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-white">建立提醒</button>
        {msg ? <p className="mt-2 text-sm text-slate-700">{msg}</p> : null}
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Pending Follow-ups</h2>
        {followups.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">暫時冇待跟進項目。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {followups.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{f.leads?.full_name || 'Unknown lead'}</p>
                  <p className="text-sm text-slate-600">{new Date(f.due_at).toLocaleString()} · {f.channel} · {f.priority}</p>
                  {f.message_draft ? <p className="text-sm text-slate-600">{f.message_draft}</p> : null}
                </div>
                <button onClick={() => markDone(f.id)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700">Mark done</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
