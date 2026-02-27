'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type CreateLeadPayload = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
};

type Step = 1 | 2 | 3;

export default function NewLeadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [step, setStep] = useState<Step>(1);
  const [hasLeads, setHasLeads] = useState<boolean>(true);
  const [checkingLeads, setCheckingLeads] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkLeads() {
      const res = await fetch('/api/leads?page=1&pageSize=1', { cache: 'no-store' }).catch(() => null);
      if (!res || !mounted) {
        setCheckingLeads(false);
        return;
      }
      const body = await res.json().catch(() => ({ data: [] }));
      setHasLeads((body.data ?? []).length > 0);
      setCheckingLeads(false);
    }
    checkLeads();

    return () => {
      mounted = false;
    };
  }, []);

  const isWizard = useMemo(() => !checkingLeads && !hasLeads, [checkingLeads, hasLeads]);

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
    setMessage('Lead 已新增 ✅ 下一步可以去 Dashboard 睇 Funnel 同每日新增走勢。');
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{isWizard ? 'First Lead Setup' : '新增 Lead'}</h1>
        <p className="mt-1 text-slate-600">
          {isWizard ? '你仲未有任何 lead，跟住 3 步設定第一筆資料。' : '填最基本資料，提交後可去 Dashboard 見到。'}
        </p>
      </div>

      {isWizard ? <WizardProgress step={step} /> : null}

      <form onSubmit={onSubmit} className="card space-y-4 p-5">
        {(step === 1 || !isWizard) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">客戶名稱 *</label>
              <input name="fullName" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Email *</label>
              <input type="email" name="email" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>
          </div>
        )}

        {(step === 2 || !isWizard) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">電話</label>
              <input name="phone" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">公司</label>
              <input name="company" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>
          </div>
        )}

        {(step === 3 || !isWizard) && (
          <>
            <div>
              <label className="mb-1 block text-sm text-slate-700">來源</label>
              <input name="source" placeholder="IG / WhatsApp / Referral" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-700">備註</label>
              <textarea name="notes" rows={4} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" />
            </div>
          </>
        )}

        <div className="flex items-center gap-3">
          {isWizard && step > 1 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))}>
              上一步
            </button>
          ) : null}

          {isWizard && step < 3 ? (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => (Math.min(3, s + 1) as Step))}>
              下一步
            </button>
          ) : (
            <button disabled={loading} type="submit" className="btn-primary disabled:opacity-60">
              {loading ? '儲存中...' : '儲存 Lead'}
            </button>
          )}

          <Link href="/dashboard" className="btn-secondary">
            返回 Dashboard
          </Link>
        </div>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </main>
  );
}

function WizardProgress({ step }: { step: Step }) {
  return (
    <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">Onboarding wizard</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {['基本資料', '公司背景', '來源與備註'].map((item, index) => {
          const active = step >= index + 1;
          return (
            <div key={item} className={`rounded-xl px-3 py-2 text-sm ${active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
              {index + 1}. {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
