import { cn } from "@/lib/utils"
import { LtdBadge } from "../primitives/ltd-badge"
import { LtdButton } from "../primitives/ltd-button"
import { ArrowLeft, MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface DetailPageHeaderProps {
  title: string
  subtitle?: string
  badge?: {
    label: string
    status?: "neutral" | "success" | "warning" | "error" | "info"
  }
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export function DetailPageHeader({
  title,
  subtitle,
  badge,
  backHref,
  backLabel = "Back",
  actions,
  className,
}: DetailPageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-ltd-text-2 hover:text-ltd-text-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ltd-text-1">{title}</h1>
            {badge && <LtdBadge status={badge.status}>{badge.label}</LtdBadge>}
          </div>
          {subtitle && <p className="text-ltd-text-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

interface DetailPageSidebarProps {
  children: React.ReactNode
  className?: string
}

export function DetailPageSidebar({ children, className }: DetailPageSidebarProps) {
  return (
    <aside
      className={cn(
        "w-80 flex-shrink-0 space-y-6 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-6",
        className
      )}
    >
      {children}
    </aside>
  )
}

interface DetailPageContentProps {
  children: React.ReactNode
  className?: string
}

export function DetailPageContent({ children, className }: DetailPageContentProps) {
  return <div className={cn("flex-1 min-w-0 space-y-6", className)}>{children}</div>
}

interface DetailPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DetailPageLayout({ children, className }: DetailPageLayoutProps) {
  return (
    <div className={cn("flex gap-6", className)}>
      {children}
    </div>
  )
}

interface DetailFieldProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-sm text-ltd-text-3">{label}</dt>
      <dd className="text-ltd-text-1">{value}</dd>
    </div>
  )
}

interface DetailFieldGroupProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function DetailFieldGroup({ title, children, className }: DetailFieldGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-ltd-text-2 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <dl className="space-y-4">{children}</dl>
    </div>
  )
}

interface DetailSectionProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DetailSection({ title, description, actions, children, className }: DetailSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-ltd-border-1 px-6 py-4">
        <div>
          <h2 className="font-semibold text-ltd-text-1">{title}</h2>
          {description && <p className="text-sm text-ltd-text-2">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

interface DetailTabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function DetailTabs({ tabs, activeTab, onTabChange, className }: DetailTabsProps) {
  return (
    <div className={cn("border-b border-ltd-border-1", className)}>
      <nav className="-mb-px flex gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-ltd-primary text-ltd-primary"
                : "border-transparent text-ltd-text-2 hover:text-ltd-text-1 hover:border-ltd-border-2"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs",
                  activeTab === tab.id
                    ? "bg-ltd-primary/10 text-ltd-primary"
                    : "bg-ltd-surface-3 text-ltd-text-2"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

interface TimelineItemProps {
  title: string
  description?: string
  timestamp: string
  icon?: React.ReactNode
  isLast?: boolean
}

export function TimelineItem({ title, description, timestamp, icon, isLast }: TimelineItemProps) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ltd-surface-3 text-ltd-text-2">
          {icon || <div className="h-2 w-2 rounded-full bg-ltd-text-3" />}
        </div>
        {!isLast && <div className="h-full w-px bg-ltd-border-1" />}
      </div>
      <div className="pb-6">
        <div className="font-medium text-ltd-text-1">{title}</div>
        {description && <p className="mt-1 text-sm text-ltd-text-2">{description}</p>}
        <time className="mt-1 text-xs text-ltd-text-3">{timestamp}</time>
      </div>
    </div>
  )
}

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn("space-y-0", className)}>{children}</div>
}
