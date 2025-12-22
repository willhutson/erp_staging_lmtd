import { cn } from "@/lib/utils"
import { LtdInput } from "../primitives/ltd-input"
import { LtdTextarea } from "../primitives/ltd-textarea"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block">
        <span className="text-sm font-medium text-ltd-text-1">
          {label}
          {required && <span className="text-ltd-error ml-1">*</span>}
        </span>
        {description && <p className="text-sm text-ltd-text-3 mt-0.5">{description}</p>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-sm text-ltd-error">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-b border-ltd-border-1 pb-4">
        <h3 className="text-lg font-semibold text-ltd-text-1">{title}</h3>
        {description && <p className="mt-1 text-sm text-ltd-text-2">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  )
}

interface FormRowProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

interface FormHeaderProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormHeader({ title, description, children, className }: FormHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-ltd-border-1 pb-6 mb-6",
        className
      )}
    >
      <div>
        <h2 className="text-xl font-semibold text-ltd-text-1">{title}</h2>
        {description && <p className="mt-1 text-sm text-ltd-text-2">{description}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {children}
      </div>
    </div>
  )
}

interface FormActionsProps {
  children: React.ReactNode
  position?: "top" | "bottom"
  className?: string
}

export function FormActions({ children, position = "top", className }: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        position === "bottom" && "border-t border-ltd-border-1 pt-6 mt-8",
        className
      )}
    >
      {children}
    </div>
  )
}
