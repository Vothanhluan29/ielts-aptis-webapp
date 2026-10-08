import React from 'react';

export default function LoadingState({ label = 'Loading…', minHeight = 'min-h-[40vh]' }) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <span className="text-sm font-medium text-zinc-500">{label}</span>
      </div>
    </div>
  );
}
