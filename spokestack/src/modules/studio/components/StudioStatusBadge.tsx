"use client";

import { cn } from "@/lib/utils";
import {
  Clock,
  FileEdit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
  Send,
  Play,
  Loader2,
} from "lucide-react";

type StatusVariant =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "archived"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "scheduled"
  | "synced"
  | "syncing"
  | "error";

interface StudioStatusBadgeProps {
  status: StatusVariant;
  label?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusVariant,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
  in_review: {
    label: "In Review",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  published: {
    label: "Published",
    icon: Send,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  scheduled: {
    label: "Scheduled",
    icon: Play,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  synced: {
    label: "Synced",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  syncing: {
    label: "Syncing",
    icon: Loader2,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export function StudioStatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  className,
}: StudioStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
            status === "processing" || status === "syncing" ? "animate-spin" : ""
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
