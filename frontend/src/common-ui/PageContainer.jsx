import React from 'react';
import clsx from 'clsx';

export default function PageContainer({ children, className }) {
  return <div className={clsx('mx-auto w-full max-w-[1600px]', className)}>{children}</div>;
}
