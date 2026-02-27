import Link from 'next/link';
import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionHref, actionLabel, icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
        {icon ?? '✦'}
      </div>
      <h3 className="text-base font-medium text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <Link className="btn-primary mt-4 inline-flex" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
