import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface LtdBadgeProps extends BadgeProps {
  status?: "success" | "warning" | "error" | "info" | "neutral"
}

function LtdBadge({ className, variant = "default", status, children, ...props }: LtdBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-[var(--ltd-radius-sm)]",
        "px-2.5 py-0.5",
        "text-xs font-semibold",
        "transition-all duration-200",
        "inline-flex items-center gap-1",
        status === "success" && "bg-ltd-state-success text-ltd-primary-text shadow-sm hover:shadow-md",
        status === "warning" && "bg-ltd-state-warning text-ltd-text-1 shadow-sm hover:shadow-md",
        status === "error" && "bg-ltd-state-error text-white shadow-sm hover:shadow-md",
        status === "info" && "bg-ltd-state-info text-white shadow-sm hover:shadow-md",
        status === "neutral" && "bg-ltd-surface-3 text-ltd-text-1 border border-ltd-border-1",
        className,
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}

export { LtdBadge }
