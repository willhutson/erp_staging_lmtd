"use client";

import { cn } from "@/lib/utils";

interface StudioEmptyStateProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function StudioEmptyState({
  icon,
  iconColor = "from-ltd-primary/20 to-[#7B61FF]/20",
  title,
  description,
  actions,
  className,
}: StudioEmptyStateProps) {
  return (
    <div
      className={cn(
        "p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br",
            iconColor
          )}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">{title}</h3>
        <p className="text-sm text-ltd-text-2 mb-6">{description}</p>
        {actions && <div className="flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
