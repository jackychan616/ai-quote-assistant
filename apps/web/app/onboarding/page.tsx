'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState('');
  const [firstLeadName, setFirstLeadName] = useState('');
  const [firstLeadEmail, setFirstLeadEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function createFirstLead() {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: firstLeadName,
        email: firstLeadEmail,
        source: `onboarding:${businessName || 'unknown'}:${niche || 'unknown'}`,
      }),
    });

    if (!res.ok) {
      setMsg('建立第一個 lead 失敗，請檢查資料。');
      return;
    }

    setMsg('完成 onboarding ✅ 已建立第一個 lead。');
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Quick Onboarding</h1>
        <p className="mt-1 text-slate-600">3 steps setup，1 分鐘內可開始用。</p>

        <div className="mt-4 flex gap-2 text-sm">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`rounded-full px-3 py-1 ${step >= n ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Step {n}
            </span>
          ))}
        </div>

        {step === 1 && (
          <div className="mt-5 space-y-3">
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <button className="btn-primary" onClick={() => setStep(2)}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Niche (e.g. beauty / tutorial / agency)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 space-y-3">
            <input
              value={firstLeadName}
              onChange={(e) => setFirstLeadName(e.target.value)}
              placeholder="First lead name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <input
              value={firstLeadEmail}
              onChange={(e) => setFirstLeadEmail(e.target.value)}
              placeholder="First lead email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={createFirstLead}>Finish</button>
            </div>
          </div>
        )}

        {msg ? <p className="mt-4 text-sm text-slate-700">{msg}</p> : null}

        <div className="mt-6">
          <Link href="/dashboard" className="btn-secondary">Skip to Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
