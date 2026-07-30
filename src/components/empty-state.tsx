import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2">
        <Icon size={20} className="text-muted" strokeWidth={1.75} />
      </div>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
