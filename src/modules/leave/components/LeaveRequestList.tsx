"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";
import type { LeaveRequest, LeaveType, LeaveStatus } from "@prisma/client";
import { reviewLeaveRequest, cancelLeaveRequest } from "../actions/leave-actions";
import { cn } from "@/lib/utils";

type RequestWithRelations = LeaveRequest & {
  leaveType: LeaveType;
  user: { id: string; name: string };
  reviewedBy?: { id: string; name: string } | null;
};

interface LeaveRequestListProps {
  requests: RequestWithRelations[];
  showUser?: boolean;
  canReview?: boolean;
  currentUserId?: string;
}

const statusConfig: Record<LeaveStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  PENDING: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-ltd-warning",
    bgColor: "bg-ltd-warning/10",
  },
  APPROVED: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-ltd-success",
    bgColor: "bg-ltd-success/10",
  },
  REJECTED: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-ltd-error",
    bgColor: "bg-ltd-error/10",
  },
  CANCELLED: {
    icon: <Ban className="w-4 h-4" />,
    color: "text-ltd-text-3",
    bgColor: "bg-ltd-surface-3",
  },
};

export function LeaveRequestList({
  requests,
  showUser = false,
  canReview = false,
  currentUserId,
}: LeaveRequestListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleReview = (requestId: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      await reviewLeaveRequest(requestId, status);
      router.refresh();
    });
  };

  const handleCancel = (requestId: string) => {
    startTransition(async () => {
      await cancelLeaveRequest(requestId);
      router.refresh();
    });
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-ltd-text-2 text-sm">
        No leave requests found
      </div>
    );
  }

  return (
    <div className="divide-y divide-ltd-border-1">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const isOwn = currentUserId === request.userId;
        const canCancel = isOwn && request.status === "PENDING";

        return (
          <div key={request.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {showUser && (
                    <span className="font-medium text-ltd-text-1">
                      {request.user.name}
                    </span>
                  )}
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: request.leaveType.color + "20",
                      color: request.leaveType.color,
                    }}
                  >
                    {request.leaveType.name}
                  </span>
                </div>

                <p className="text-sm text-ltd-text-2">
                  {formatDate(request.startDate)}
                  {request.startDate.getTime() !== request.endDate.getTime() && (
                    <> – {formatDate(request.endDate)}</>
                  )}
                  <span className="text-ltd-text-3 ml-2">
                    ({Number(request.totalDays)} {Number(request.totalDays) === 1 ? "day" : "days"})
                  </span>
                  {request.isHalfDay && (
                    <span className="text-ltd-text-3 ml-1">
                      ({request.halfDayPeriod?.toLowerCase()})
                    </span>
                  )}
                </p>

                {request.reason && (
                  <p className="text-sm text-ltd-text-2 mt-1">{request.reason}</p>
                )}

                {request.reviewedBy && (
                  <p className="text-xs text-ltd-text-3 mt-2">
                    {request.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
                    {request.reviewedBy.name}
                    {request.reviewNotes && ` – "${request.reviewNotes}"`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
                    config.bgColor,
                    config.color
                  )}
                >
                  {config.icon}
                  {request.status}
                </span>

                {canReview && request.status === "PENDING" && !isOwn && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReview(request.id, "APPROVED")}
                      disabled={isPending}
                      className="p-1.5 text-ltd-success hover:bg-ltd-success/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReview(request.id, "REJECTED")}
                      disabled={isPending}
                      className="p-1.5 text-ltd-error hover:bg-ltd-error/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {canCancel && (
                  <button
                    onClick={() => handleCancel(request.id)}
                    disabled={isPending}
                    className="text-xs text-ltd-text-2 hover:text-ltd-error transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
