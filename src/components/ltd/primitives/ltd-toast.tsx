"use client"

import { Toaster, toast as sonnerToast, type ExternalToast } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle, Info, Bell, type LucideIcon } from "lucide-react"

// LTD Design System Toaster with consistent styling
export function LtdToaster() {
  return (
    <Toaster
      position="bottom-right"
      gap={8}
      toastOptions={{
        style: {
          background: "var(--ltd-surface-2)",
          border: "1px solid var(--ltd-border-1)",
          color: "var(--ltd-text-1)",
          borderRadius: "var(--ltd-radius-md)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        className: "ltd-toast",
      }}
      theme="system"
      closeButton
      richColors
      expand={false}
    />
  )
}

// Toast type configuration
interface ToastIconConfig {
  icon: LucideIcon
  className: string
}

const toastIcons: Record<string, ToastIconConfig> = {
  success: { icon: CheckCircle2, className: "text-ltd-state-success" },
  error: { icon: XCircle, className: "text-ltd-state-error" },
  warning: { icon: AlertTriangle, className: "text-ltd-state-warning" },
  info: { icon: Info, className: "text-ltd-state-info" },
  default: { icon: Bell, className: "text-ltd-text-2" },
}

interface ToastOptions extends ExternalToast {
  icon?: LucideIcon
}

// Helper to create consistent icon element
function createIcon(type: keyof typeof toastIcons): React.ReactNode {
  const config = toastIcons[type]
  const IconComponent = config.icon
  return <IconComponent className={`h-5 w-5 ${config.className}`} />
}

// LTD Toast utility functions
export const ltdToast = {
  // Success toast - use for successful operations
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      icon: createIcon("success"),
      ...options,
    })
  },

  // Error toast - use for failed operations
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      icon: createIcon("error"),
      duration: 5000, // Errors stay longer
      ...options,
    })
  },

  // Warning toast - use for cautions and alerts
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      icon: createIcon("warning"),
      ...options,
    })
  },

  // Info toast - use for neutral information
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      icon: createIcon("info"),
      ...options,
    })
  },

  // Default toast - for general messages
  message: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, {
      icon: createIcon("default"),
      ...options,
    })
  },

  // Loading toast with promise support
  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, options)
  },

  // Promise toast - shows loading, then success/error
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },

  // Dismiss a toast
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id)
  },

  // Custom toast with full control
  custom: sonnerToast.custom,
}

// Export toast for backward compatibility
export { sonnerToast as toast }
