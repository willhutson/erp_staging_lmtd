import { cn } from "@/lib/utils"

interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function SectionCard({
  title,
  description,
  children,
  actions,
  className,
  noPadding,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-ltd-border-1 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-ltd-text-1">{title}</h3>}
            {description && <p className="mt-1 text-sm text-ltd-text-2">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>{children}</div>
    </div>
  )
}

interface SectionGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function SectionGrid({ children, columns = 2, className }: SectionGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 lg:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}
