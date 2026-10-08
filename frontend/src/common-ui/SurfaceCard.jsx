import React from 'react';
import clsx from 'clsx';

export default function SurfaceCard({ children, className, bodyClassName }) {
  return (
    <section className={clsx('rounded-2xl border border-zinc-200/80 bg-white shadow-sm', className)}>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
