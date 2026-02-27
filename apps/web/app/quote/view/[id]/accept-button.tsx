'use client';

import { useState } from 'react';

export default function AcceptButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function accept() {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/quotes/${quoteId}/accept`, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    setMsg(res.ok ? 'Quote accepted ✅' : `接受失敗：${body?.error ?? 'unknown error'}`);
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={accept} disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? '處理中...' : 'Accept Quote'}
      </button>
      {msg ? <span className="text-sm text-slate-700">{msg}</span> : null}
    </div>
  );
}
