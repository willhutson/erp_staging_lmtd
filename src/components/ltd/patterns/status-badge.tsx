import { LtdBadge } from "../primitives/ltd-badge"

export type Status = "draft" | "in-review" | "approved" | "active" | "blocked" | "completed" | "archived"

const statusConfig: Record<
  Status,
  {
    label: string
    variant: "success" | "warning" | "error" | "info" | "neutral"
  }
> = {
  draft: { label: "Draft", variant: "neutral" },
  "in-review": { label: "In Review", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  active: { label: "Active", variant: "success" },
  blocked: { label: "Blocked", variant: "error" },
  completed: { label: "Completed", variant: "neutral" },
  archived: { label: "Archived", variant: "neutral" },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <LtdBadge status={config.variant} className={className}>
      {config.label}
    </LtdBadge>
  )
}
