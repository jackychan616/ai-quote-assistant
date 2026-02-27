import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-slate-900">
              AI Quote Assistant
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
              <Link className="btn-secondary !px-3 !py-1.5" href="/dashboard">Dashboard</Link>
              <Link className="btn-secondary !px-3 !py-1.5" href="/onboarding">Onboarding</Link>
              <Link className="btn-secondary !px-3 !py-1.5" href="/quotes">Quotes</Link>
              <Link className="btn-secondary !px-3 !py-1.5" href="/followups">Follow-ups</Link>
              <Link className="btn-primary !px-3 !py-1.5" href="/lead/new">+ Lead</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
