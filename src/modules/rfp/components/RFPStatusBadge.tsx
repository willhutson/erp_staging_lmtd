import type { RFPStatus } from "@prisma/client";
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge";

type BadgeStatus = "success" | "warning" | "error" | "info" | "neutral";

interface RFPStatusBadgeProps {
  status: RFPStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<RFPStatus, { label: string; variant: BadgeStatus }> = {
  VETTING: { label: "Vetting", variant: "neutral" },
  ACTIVE: { label: "Active", variant: "info" },
  AWAITING_REVIEW: { label: "Awaiting Review", variant: "warning" },
  READY_TO_SUBMIT: { label: "Ready to Submit", variant: "info" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  AWAITING_RESPONSE: { label: "Awaiting Response", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "error" },
  ABANDONED: { label: "Abandoned", variant: "neutral" },
};

export function RFPStatusBadge({ status, className }: RFPStatusBadgeProps) {
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
