"use client";

import { cn } from "@/lib/utils";

interface StudioHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  className?: string;
}

export function StudioHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: StudioHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 text-sm">
          <ol className="flex items-center gap-1.5">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-ltd-text-3">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-ltd-text-2 hover:text-ltd-primary transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ltd-text-3">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">{title}</h1>
          {description && (
            <p className="text-sm text-ltd-text-2 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
