import type * as React from "react"
import { StatusBadge, type Status } from "./status-badge"

interface ObjectHeaderProps {
  title: string
  subtitle?: string
  status?: Status
  meta?: Array<{ label: string; value: string }>
  actions?: React.ReactNode
  owner?: string
  team?: string
}

export function ObjectHeader({ title, subtitle, status, meta, actions, owner, team }: ObjectHeaderProps) {
  return (
    <div className="border-b border-ltd-border-1 bg-ltd-surface-overlay p-[var(--ltd-density-card-padding)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-ltd-text-1">{title}</h1>
            {status && <StatusBadge status={status} />}
          </div>
          {subtitle && <p className="text-sm text-ltd-text-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {(meta || owner || team) && (
        <div className="flex flex-wrap gap-6 text-sm">
          {meta?.map((item, i) => (
            <div key={i}>
              <span className="text-ltd-text-3">{item.label}: </span>
              <span className="text-ltd-text-1 font-medium">{item.value}</span>
            </div>
          ))}
          {owner && (
            <div>
              <span className="text-ltd-text-3">Owner: </span>
              <span className="text-ltd-text-1 font-medium">{owner}</span>
            </div>
          )}
          {team && (
            <div>
              <span className="text-ltd-text-3">Team: </span>
              <span className="text-ltd-text-1 font-medium">{team}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
