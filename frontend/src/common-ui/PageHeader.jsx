import React from 'react';
import clsx from 'clsx';

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={clsx('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
