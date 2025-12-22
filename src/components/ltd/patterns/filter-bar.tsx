"use client"

import { cn } from "@/lib/utils"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { LtdButton } from "../primitives/ltd-button"
import { LtdInput } from "../primitives/ltd-input"

interface FilterBarProps {
  children?: React.ReactNode
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onClear?: () => void
  showClear?: boolean
  className?: string
}

export function FilterBar({
  children,
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  onClear,
  showClear,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4",
        className
      )}
    >
      {onSearchChange && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ltd-text-3" />
          <LtdInput
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
        </div>
      )}
      {children}
      {showClear && onClear && (
        <LtdButton variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </LtdButton>
      )}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
  className?: string
}

export function FilterSelect({ label, value, options, onChange, className }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-[var(--ltd-density-control-height)] rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-overlay px-3 text-sm text-ltd-text-1 focus:border-ltd-border-focus focus:outline-none focus:ring-2 focus:ring-ltd-ring-focus/20",
        className
      )}
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ltd-primary/10 px-3 py-1 text-sm font-medium text-ltd-primary">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-ltd-primary/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
