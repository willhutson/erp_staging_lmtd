import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "compact" | "icon"
  className?: string
  showOS?: boolean
}

export function Logo({ size = "md", variant = "default", className, showOS = true }: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", slash: "text-2xl", os: "text-xs", powered: "text-[10px]" },
    md: { text: "text-2xl", slash: "text-3xl", os: "text-sm", powered: "text-xs" },
    lg: { text: "text-4xl", slash: "text-5xl", os: "text-base", powered: "text-sm" },
    xl: { text: "text-6xl", slash: "text-7xl", os: "text-lg", powered: "text-base" },
  }

  const currentSize = sizes[size]

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <div
          className={cn(
            "font-bold bg-gradient-to-br from-ltd-primary via-ltd-brand-accent to-ltd-brand-accent-secondary bg-clip-text text-transparent",
            currentSize.text,
          )}
        >
          L/
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-baseline gap-0.5", className)}>
        <span className={cn("font-bold text-ltd-text-1", currentSize.text)}>LMTD</span>
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-ltd-primary to-ltd-brand-accent bg-clip-text text-transparent",
            currentSize.slash,
          )}
        >
          /
        </span>
      </div>
    )
  }

  return (
    <div className={cn("inline-flex flex-col gap-0.5", className)}>
      <div className="inline-flex items-baseline gap-0.5">
        <span className={cn("font-bold text-ltd-text-1 tracking-tight", currentSize.text)}>LMTD</span>
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-ltd-primary via-ltd-brand-accent to-ltd-brand-accent-secondary bg-clip-text text-transparent animate-pulse-subtle",
            currentSize.slash,
          )}
        >
          /
        </span>
      </div>
      {showOS && (
        <div className="flex flex-col gap-0 -mt-1">
          <div className={cn("font-semibold tracking-wide text-ltd-text-2", currentSize.os)}>OPERATING SYSTEM</div>
          <div className={cn("font-medium tracking-wider text-ltd-text-3 opacity-60", currentSize.powered)}>
            POWERED BY SPOKESTACK
          </div>
        </div>
      )}
    </div>
  )
}
