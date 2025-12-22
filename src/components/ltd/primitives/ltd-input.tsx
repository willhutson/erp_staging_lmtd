import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface LtdInputProps extends React.ComponentProps<"input"> {
  surface?: "internal" | "client"
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LtdInput = React.forwardRef<HTMLInputElement, LtdInputProps>(({ className, surface, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn(
        "h-[var(--ltd-density-control-height)]",
        "px-[var(--ltd-density-control-paddingX)]",
        "bg-ltd-surface-1 border-ltd-border-1 text-ltd-text-1",
        "rounded-[var(--ltd-radius-md)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ltd-border-focus focus-visible:ring-offset-0",
        "placeholder:text-ltd-text-3",
        className,
      )}
      {...props}
    />
  )
})
LtdInput.displayName = "LtdInput"

export { LtdInput }
