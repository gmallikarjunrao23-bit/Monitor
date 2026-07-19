import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-20 text-center animate-fade-up">
      <div className="mb-4 rounded-full bg-white/5 p-3">
        <Icon size={24} className="text-text-muted" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-signal px-4 py-2 text-xs font-medium text-bg hover:opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
