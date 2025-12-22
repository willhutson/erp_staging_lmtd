"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { StatusBadge, type Status } from "@/components/ltd/patterns/status-badge"
import { formatDate } from "@/lib/format/date"

interface StreamItem {
  id: string
  title: string
  type: string
  status: Status
  owner: string
  updatedAt: string
  priority?: "high" | "medium" | "low"
  blockedReason?: string
}

interface StreamCardProps {
  item: StreamItem
  onSelect: (id: string) => void
  actions?: React.ReactNode
}

export function StreamCard({ item, onSelect, actions }: StreamCardProps) {
  return (
    <Card
      className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)] hover:border-ltd-border-2 transition-colors cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-ltd-text-1">{item.title}</h4>
            {item.priority === "high" && (
              <span className="text-xs px-2 py-0.5 bg-ltd-error/10 text-ltd-error rounded-full">High Priority</span>
            )}
          </div>
          <p className="text-sm text-ltd-text-2">{item.type}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.blockedReason && (
        <div className="mb-3 p-2 bg-ltd-error-bg border border-ltd-error rounded-[var(--ltd-radius-sm)] text-sm text-ltd-text-1">
          <span className="font-medium">Blocked: </span>
          {item.blockedReason}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ltd-text-3">
        <span>Owner: {item.owner}</span>
        <span>{formatDate(item.updatedAt, "relative")}</span>
      </div>

      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </Card>
  )
}
