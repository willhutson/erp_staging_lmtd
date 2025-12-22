"use client"

import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
import { LtdBadge } from "../primitives/ltd-badge"

interface KanbanColumnProps {
  title: string
  count?: number
  color?: string
  children: React.ReactNode
  className?: string
}

export function KanbanColumn({ title, count, color, children, className }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-[var(--ltd-radius-lg)] bg-ltd-surface-2",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
        <div className="flex items-center gap-2">
          {color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />}
          <h3 className="font-semibold text-ltd-text-1">{title}</h3>
          {count !== undefined && (
            <span className="rounded-full bg-ltd-surface-3 px-2 py-0.5 text-xs font-medium text-ltd-text-2">
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">{children}</div>
    </div>
  )
}

interface KanbanCardProps {
  title: string
  subtitle?: string
  status?: string
  statusVariant?: "success" | "warning" | "error" | "info" | "neutral"
  meta?: Array<{ label: string; value: string }>
  avatar?: { initials: string; color?: string }
  lastActivity?: Date
  staleDays?: number // Days of inactivity before showing stale indicator
  onClick?: () => void
  className?: string
}

function getDaysSince(date: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function formatLastActivity(days: number): string {
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "1 week ago"
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return "1 month ago"
  return `${Math.floor(days / 30)} months ago`
}

export function KanbanCard({
  title,
  subtitle,
  status,
  statusVariant = "neutral",
  meta,
  avatar,
  lastActivity,
  staleDays = 14,
  onClick,
  className,
}: KanbanCardProps) {
  const daysSinceActivity = lastActivity ? getDaysSince(lastActivity) : null
  const isStale = daysSinceActivity !== null && daysSinceActivity >= staleDays
  const isWarning = daysSinceActivity !== null && daysSinceActivity >= Math.floor(staleDays / 2) && !isStale

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--ltd-radius-md)] border bg-ltd-surface-overlay p-4 transition-all hover:shadow-md",
        isStale
          ? "border-ltd-warning/50 bg-ltd-warning/5"
          : "border-ltd-border-1 hover:border-ltd-border-2",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-ltd-text-1 truncate">{title}</h4>
          {subtitle && <p className="mt-1 text-sm text-ltd-text-2 truncate">{subtitle}</p>}
        </div>
        {avatar && (
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: avatar.color || "#52EDC7" }}
          >
            {avatar.initials}
          </div>
        )}
      </div>

      {meta && meta.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.map((item, i) => (
            <span key={i} className="text-xs text-ltd-text-3">
              <span className="font-medium">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {status ? (
          <LtdBadge status={statusVariant}>{status}</LtdBadge>
        ) : (
          <span />
        )}

        {/* Stale indicator */}
        {daysSinceActivity !== null && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              isStale ? "text-ltd-warning font-medium" : isWarning ? "text-ltd-text-3" : "text-ltd-text-3"
            )}
            title={`Last activity: ${formatLastActivity(daysSinceActivity)}`}
          >
            <Clock className={cn("w-3 h-3", isStale && "animate-pulse")} />
            <span>{formatLastActivity(daysSinceActivity)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  children: React.ReactNode
  className?: string
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-4 -mx-4 px-4",
        className
      )}
    >
      {children}
    </div>
  )
}
