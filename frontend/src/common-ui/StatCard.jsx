import React from 'react';
import clsx from 'clsx';

export default function StatCard({ label, value, icon: Icon, tone = 'blue', description, className }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className={clsx('flex min-h-28 items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm', className)}>
      {Icon && <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tones[tone] || tones.blue)}><Icon size={20} /></div>}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">{value ?? 0}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
    </div>
  );
}
