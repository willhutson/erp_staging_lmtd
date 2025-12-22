"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PageShellProps {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  maxWidth?: "full" | "7xl" | "6xl" | "5xl"
}

export function PageShell({
  children,
  breadcrumbs,
  title,
  description,
  actions,
  className,
  maxWidth = "7xl"
}: PageShellProps) {
  const maxWidthClass = {
    full: "",
    "7xl": "max-w-7xl",
    "6xl": "max-w-6xl",
    "5xl": "max-w-5xl",
  }[maxWidth]

  return (
    <div className={cn("p-6", className)}>
      <div className={cn("mx-auto", maxWidthClass)}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4 flex items-center gap-2 text-sm text-ltd-text-2">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-ltd-text-1 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ltd-text-1">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Page Header */}
        {(title || actions) && (
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              {title && <h1 className="text-2xl font-bold text-ltd-text-1">{title}</h1>}
              {description && <p className="text-ltd-text-2 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
          </div>
        )}

        {/* Page Content */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}
