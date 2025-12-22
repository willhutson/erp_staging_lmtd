import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface LtdTextareaProps extends React.ComponentProps<"textarea"> {
  surface?: "internal" | "client"
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LtdTextarea = React.forwardRef<HTMLTextAreaElement, LtdTextareaProps>(({ className, surface, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "px-[var(--ltd-density-control-paddingX)]",
        "py-[var(--ltd-density-control-paddingY)]",
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
LtdTextarea.displayName = "LtdTextarea"

export { LtdTextarea }
