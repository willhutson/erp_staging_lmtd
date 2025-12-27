import type { BriefStatus } from "@prisma/client";
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge";

type BadgeStatus = "success" | "warning" | "error" | "info" | "neutral";

const statusConfig: Record<BriefStatus, { label: string; variant: BadgeStatus }> = {
  DRAFT: { label: "Draft", variant: "neutral" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  IN_REVIEW: { label: "In Review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  INTERNAL_REVIEW: { label: "Internal Review", variant: "warning" },
  CLIENT_REVIEW: { label: "Client Review", variant: "warning" },
  REVISIONS: { label: "Revisions", variant: "error" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
};

interface StatusBadgeProps {
  status: BriefStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <LtdBadge
      status={config.variant}
      className={className}
    >
      {config.label}
    </LtdBadge>
  );
}
