import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"

export type MomentumLevel = "stalled" | "slow" | "steady" | "accelerating"

interface MomentumIndicatorProps {
  level: MomentumLevel
  daysInStatus: number
  className?: string
}

const momentumConfig: Record<
  MomentumLevel,
  {
    label: string
    color: "error" | "warning" | "success" | "info"
    description: string
  }
> = {
  stalled: {
    label: "Stalled",
    color: "error",
    description: "No progress in 7+ days",
  },
  slow: {
    label: "Slow",
    color: "warning",
    description: "Limited recent activity",
  },
  steady: {
    label: "Steady",
    color: "info",
    description: "Regular progress",
  },
  accelerating: {
    label: "Accelerating",
    color: "success",
    description: "High velocity",
  },
}

export function MomentumIndicator({ level, daysInStatus, className }: MomentumIndicatorProps) {
  const config = momentumConfig[level]

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <LtdBadge status={config.color}>{config.label}</LtdBadge>
        <span className="text-xs text-ltd-text-3">
          {daysInStatus} day{daysInStatus !== 1 ? "s" : ""} in status
        </span>
      </div>
      <p className="text-xs text-ltd-text-2 mt-1">{config.description}</p>
    </div>
  )
}
