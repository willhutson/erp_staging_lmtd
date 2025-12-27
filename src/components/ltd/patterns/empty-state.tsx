"use client"

import Link from "next/link"
import { LtdButton } from "../primitives/ltd-button"
import { Inbox, FileText, Users, Calendar, FolderOpen, Search, type LucideIcon } from "lucide-react"

// Common empty state icons
export const emptyStateIcons = {
  inbox: Inbox,
  document: FileText,
  users: Users,
  calendar: Calendar,
  folder: FolderOpen,
  search: Search,
} as const

type EmptyStateIconKey = keyof typeof emptyStateIcons

interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: EmptyStateIconKey | LucideIcon
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon = "inbox",
  primaryAction,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  // Resolve icon
  const IconComponent = typeof icon === "string" ? emptyStateIcons[icon] : icon

  const renderAction = (action: EmptyStateAction, variant: "default" | "outline") => {
    if (action.href) {
      return (
        <LtdButton variant={variant} asChild>
          <Link href={action.href}>{action.label}</Link>
        </LtdButton>
      )
    }
    return (
      <LtdButton variant={variant} onClick={action.onClick}>
        {action.label}
      </LtdButton>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "py-8" : "py-12"} px-4 text-center`}>
      <div className={`${compact ? "mb-3" : "mb-4"} rounded-[var(--ltd-radius-lg)] bg-ltd-surface-2 ${compact ? "p-4" : "p-6"}`}>
        <IconComponent
          className={`${compact ? "h-8 w-8" : "h-12 w-12"} text-ltd-text-3 mx-auto`}
          strokeWidth={1.5}
        />
      </div>
      <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold text-ltd-text-1 mb-2`}>{title}</h3>
      {description && (
        <p className={`text-sm text-ltd-text-2 max-w-md ${primaryAction || secondaryAction ? "mb-6" : ""}`}>
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex gap-3">
          {primaryAction && renderAction(primaryAction, "default")}
          {secondaryAction && renderAction(secondaryAction, "outline")}
        </div>
      )}
    </div>
  )
}
