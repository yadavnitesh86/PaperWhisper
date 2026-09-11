import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-paper-200 text-ink-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-ink-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
