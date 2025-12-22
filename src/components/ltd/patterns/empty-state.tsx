"use client"
import { LtdButton } from "../primitives/ltd-button"

interface EmptyStateProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 rounded-[var(--ltd-radius-lg)] bg-ltd-surface-2 p-6">
        <svg
          className="h-12 w-12 text-ltd-text-3 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">{title}</h3>
      {description && <p className="text-sm text-ltd-text-2 max-w-md mb-6">{description}</p>}
      <div className="flex gap-3">
        {primaryAction && <LtdButton onClick={primaryAction.onClick}>{primaryAction.label}</LtdButton>}
        {secondaryAction && (
          <LtdButton variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </LtdButton>
        )}
      </div>
    </div>
  )
}
