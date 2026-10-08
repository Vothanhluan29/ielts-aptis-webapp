import React from 'react';
import clsx from 'clsx';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {Icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"><Icon size={24} /></div>}
      <h3 className="text-base font-semibold text-zinc-800">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
