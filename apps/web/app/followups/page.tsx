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

const templates = [
  'Hi！想跟進返你之前報價，如果你方便我可以幫你落實下一步。',
  '想確認你對上次報價有冇問題？我可以按你預算再微調方案。',
  'Friendly reminder：本週有時段可安排啟動，如果你ok我可以即刻預留。',
];

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
    const rows: Followup[] = followupsBody.data ?? [];
    rows.sort((a, b) => +new Date(a.due_at) - +new Date(b.due_at));
    setFollowups(rows);
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

  async function sendNow(id: string) {
    const res = await fetch(`/api/followups/${id}/send`, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(`已模擬發送：${body?.sent?.channel ?? ''} -> ${body?.sent?.to ?? ''}`);
    } else {
      setMsg(`發送失敗：${body?.error ?? 'unknown error'}`);
    }
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Follow-ups</h1>
        <Link href="/dashboard" className="btn-secondary">返回 Dashboard</Link>
      </div>

      <section className="card mt-5 p-4">
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

        <div className="mt-2 flex flex-wrap gap-2">
          {templates.map((t) => (
            <button key={t} type="button" onClick={() => setMessageDraft(t)} className="btn-secondary !px-2.5 !py-1.5 !text-xs">
              套用模板
            </button>
          ))}
        </div>

        <button onClick={createFollowup} className="btn-primary mt-3">建立提醒</button>
        {msg ? <p className="mt-2 text-sm text-slate-700">{msg}</p> : null}
      </section>

      <section className="card mt-5 p-4">
        <h2 className="text-lg font-medium text-slate-900">Pending Follow-ups</h2>
        {followups.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">暫時冇待跟進項目。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {followups.map((f) => {
              const overdue = new Date(f.due_at).getTime() < Date.now();
              return (
                <li
                  key={f.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    overdue ? 'border-rose-200 bg-rose-50' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{f.leads?.full_name || 'Unknown lead'}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(f.due_at).toLocaleString()} · {f.channel} · {f.priority}
                      {overdue ? ' · OVERDUE' : ''}
                    </p>
                    {f.message_draft ? <p className="text-sm text-slate-600">{f.message_draft}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sendNow(f.id)} className="btn-primary !px-3 !py-1.5 !text-sm">Send now</button>
                    <button onClick={() => markDone(f.id)} className="btn-secondary !px-3 !py-1.5 !text-sm">Mark done</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
