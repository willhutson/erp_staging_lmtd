import type { RFPStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface RFPStatusBadgeProps {
  status: RFPStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  RFPStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  VETTING: { label: "Vetting", bgColor: "bg-gray-100", textColor: "text-gray-700" },
  ACTIVE: { label: "Active", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  AWAITING_REVIEW: {
    label: "Awaiting Review",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  READY_TO_SUBMIT: {
    label: "Ready to Submit",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  SUBMITTED: {
    label: "Submitted",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
  },
  AWAITING_RESPONSE: {
    label: "Awaiting Response",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  WON: { label: "Won", bgColor: "bg-green-100", textColor: "text-green-700" },
  LOST: { label: "Lost", bgColor: "bg-red-100", textColor: "text-red-700" },
  ABANDONED: {
    label: "Abandoned",
    bgColor: "bg-gray-100",
    textColor: "text-gray-500",
  },
};

export function RFPStatusBadge({ status, size = "sm" }: RFPStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.bgColor,
        config.textColor,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
