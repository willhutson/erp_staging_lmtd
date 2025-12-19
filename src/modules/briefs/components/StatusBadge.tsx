import type { BriefStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<BriefStatus, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-700" },
  INTERNAL_REVIEW: { label: "Internal Review", color: "bg-orange-100 text-orange-700" },
  CLIENT_REVIEW: { label: "Client Review", color: "bg-pink-100 text-pink-700" },
  REVISIONS: { label: "Revisions", color: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
};

interface StatusBadgeProps {
  status: BriefStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
