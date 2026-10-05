import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in",
        className
      )}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-5 ring-1 ring-slate-100">
        <Icon className="w-9 h-9 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
