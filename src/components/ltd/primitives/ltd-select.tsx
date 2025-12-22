"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface LtdSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string }>
  className?: string
}

const LtdSelect = React.forwardRef<HTMLButtonElement, LtdSelectProps>(
  ({ value, onValueChange, placeholder, options, className }, ref) => {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          ref={ref}
          className={cn(
            "h-[var(--ltd-density-control-height)]",
            "px-[var(--ltd-density-control-paddingX)]",
            "bg-ltd-surface-1 border-ltd-border-1 text-ltd-text-1",
            "rounded-[var(--ltd-radius-md)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ltd-border-focus focus-visible:ring-offset-0",
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  },
)
LtdSelect.displayName = "LtdSelect"

export { LtdSelect }
