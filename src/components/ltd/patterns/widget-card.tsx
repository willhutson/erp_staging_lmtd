import { cn } from "@/lib/utils"
import { MoreHorizontal, Maximize2 } from "lucide-react"

interface WidgetCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  noPadding?: boolean
  className?: string
}

export function WidgetCard({
  title,
  subtitle,
  children,
  actions,
  noPadding,
  className,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-ltd-border-1 px-4 py-3">
        <div>
          <h3 className="font-semibold text-ltd-text-1">{title}</h3>
          {subtitle && <p className="text-xs text-ltd-text-3">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
      <div className={cn("flex-1", !noPadding && "p-4")}>{children}</div>
    </div>
  )
}

interface WidgetListItemProps {
  title: string
  subtitle?: string
  value?: string | number
  status?: React.ReactNode
  onClick?: () => void
}

export function WidgetListItem({ title, subtitle, value, status, onClick }: WidgetListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-3 border-b border-ltd-border-1 last:border-0",
        onClick && "cursor-pointer hover:bg-ltd-surface-3 -mx-4 px-4 transition-colors"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-ltd-text-1 truncate">{title}</div>
        {subtitle && <div className="text-sm text-ltd-text-2 truncate">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {value && <span className="font-semibold text-ltd-text-1 tabular-nums">{value}</span>}
        {status}
      </div>
    </div>
  )
}

interface WidgetProgressProps {
  label: string
  value: number
  max?: number
  showPercentage?: boolean
  color?: "primary" | "success" | "warning" | "error"
}

export function WidgetProgress({
  label,
  value,
  max = 100,
  showPercentage = true,
  color = "primary",
}: WidgetProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    primary: "bg-ltd-primary",
    success: "bg-ltd-success",
    warning: "bg-ltd-warning",
    error: "bg-ltd-error",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ltd-text-2">{label}</span>
        {showPercentage && (
          <span className="font-medium text-ltd-text-1">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="h-2 rounded-full bg-ltd-surface-3 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
