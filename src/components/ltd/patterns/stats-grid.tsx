import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeLabel = "vs last period",
  trend,
  icon,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <div
      className={cn(
        "rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-[var(--ltd-density-card-padding)] transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium text-ltd-text-2">{label}</div>
        {icon && <div className="text-ltd-text-3">{icon}</div>}
      </div>
      <div className="mt-2 text-3xl font-bold text-ltd-text-1 tabular-nums">{value}</div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <TrendIcon
            className={cn(
              "h-4 w-4",
              trend === "up" && "text-ltd-success",
              trend === "down" && "text-ltd-error",
              trend === "neutral" && "text-ltd-text-3"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              trend === "up" && "text-ltd-success",
              trend === "down" && "text-ltd-error",
              trend === "neutral" && "text-ltd-text-3"
            )}
          >
            {change > 0 ? "+" : ""}
            {change}% {changeLabel}
          </span>
        </div>
      )}
    </div>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}
