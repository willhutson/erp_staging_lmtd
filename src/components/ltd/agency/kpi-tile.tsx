import { Card } from "@/components/ui/card"
import { formatNumber } from "@/lib/format/number"

interface KpiTileProps {
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  format?: "default" | "compact" | "percentage"
}

export function KpiTile({ label, value, change, trend, format = "default" }: KpiTileProps) {
  const displayValue = typeof value === "number" ? formatNumber(value, format) : value

  return (
    <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
      <div className="text-sm text-ltd-text-2 mb-1">{label}</div>
      <div className="text-2xl font-bold text-ltd-text-1 tabular-nums mb-1">{displayValue}</div>
      {change !== undefined && (
        <div
          className={`text-xs font-medium ${
            trend === "up" ? "text-ltd-success" : trend === "down" ? "text-ltd-error" : "text-ltd-text-3"
          }`}
        >
          {change > 0 ? "+" : ""}
          {formatNumber(change, "percentage")} vs last period
        </div>
      )}
    </Card>
  )
}
