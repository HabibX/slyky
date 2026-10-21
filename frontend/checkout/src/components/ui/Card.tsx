import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-[var(--color-border)] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}