import React from 'react';
import clsx from 'clsx';

export default function WorkspaceShell({ sidebar, header, children, className, contentClassName = '' }) {
  return (
    <div className={clsx('flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900', className)}>
      {sidebar}
      <div className="relative flex w-full flex-1 flex-col overflow-hidden">
        {header}
        <main className={`custom-scrollbar relative z-0 flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 lg:p-10 ${contentClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
