import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LtdButtonProps extends ButtonProps {
  surface?: "internal" | "client"
}

const LtdButton = React.forwardRef<HTMLButtonElement, LtdButtonProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, variant = "default", surface, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "h-[var(--ltd-density-control-height)]",
          "px-[var(--ltd-density-control-paddingX)]",
          "rounded-[var(--ltd-radius-md)]",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ltd-ring-focus focus-visible:ring-offset-2",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" && [
            "bg-ltd-primary hover:bg-ltd-primary-hover active:bg-ltd-primary-active",
            "text-ltd-primary-text font-semibold",
            "shadow-sm hover:shadow-md",
          ],
          variant === "outline" && [
            "border-2 border-ltd-border-1 hover:border-ltd-primary",
            "bg-transparent hover:bg-ltd-primary/5",
            "text-ltd-text-1",
          ],
          variant === "ghost" && "hover:bg-ltd-surface-2 text-ltd-text-1",
          variant === "destructive" && [
            "bg-destructive hover:bg-destructive/90",
            "text-destructive-foreground font-semibold",
            "shadow-sm hover:shadow-md",
          ],
          className,
        )}
        {...props}
      />
    )
  },
)
LtdButton.displayName = "LtdButton"

export { LtdButton }
