"use client";

import { useTransition } from "react";
import type { RFP, RFPSubitem, RFPStatus } from "@prisma/client";
import { RFPStatusBadge } from "./RFPStatusBadge";
import { updateRFPStatus } from "../actions/rfp-actions";
import { Calendar, DollarSign, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type RFPWithSubitems = RFP & { subitems: RFPSubitem[] };

interface RFPPipelineProps {
  rfps: RFPWithSubitems[];
}

const pipelineStages: { status: RFPStatus; label: string }[] = [
  { status: "VETTING", label: "Vetting" },
  { status: "ACTIVE", label: "Active" },
  { status: "AWAITING_REVIEW", label: "Awaiting Review" },
  { status: "READY_TO_SUBMIT", label: "Ready to Submit" },
  { status: "SUBMITTED", label: "Submitted" },
  { status: "AWAITING_RESPONSE", label: "Awaiting Response" },
];

export function RFPPipeline({ rfps }: RFPPipelineProps) {
  const [, startTransition] = useTransition();

  const getRFPsForStage = (status: RFPStatus) => {
    return rfps.filter((rfp) => rfp.status === status);
  };

  const handleMoveNext = (rfp: RFP) => {
    const currentIndex = pipelineStages.findIndex((s) => s.status === rfp.status);
    if (currentIndex < pipelineStages.length - 1) {
      const nextStatus = pipelineStages[currentIndex + 1].status;
      startTransition(async () => {
        await updateRFPStatus(rfp.id, nextStatus);
      });
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipelineStages.map((stage) => {
        const stageRFPs = getRFPsForStage(stage.status);
        return (
          <div
            key={stage.status}
            className="flex-shrink-0 w-72 bg-gray-50 rounded-xl"
          >
            {/* Column header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">
                  {stage.label}
                </h3>
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                  {stageRFPs.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[200px]">
              {stageRFPs.map((rfp) => {
                const daysLeft = getDaysUntilDeadline(rfp.deadline);
                const completedSubitems = rfp.subitems.filter(
                  (s) => s.status === "COMPLETED"
                ).length;
                const totalSubitems = rfp.subitems.length;

                return (
                  <div
                    key={rfp.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/rfp/${rfp.id}`}
                        className="font-medium text-gray-900 text-sm hover:text-[#1BA098]"
                      >
                        {rfp.name}
                      </Link>
                    </div>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span
                          className={cn(
                            daysLeft < 3 && "text-red-500 font-medium",
                            daysLeft >= 3 && daysLeft <= 7 && "text-yellow-600"
                          )}
                        >
                          {daysLeft < 0
                            ? "Overdue"
                            : daysLeft === 0
                            ? "Due today"
                            : `${daysLeft} days left`}
                        </span>
                      </div>

                      {rfp.estimatedValue && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{formatCurrency(Number(rfp.estimatedValue))}</span>
                        </div>
                      )}

                      {totalSubitems > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#52EDC7] rounded-full"
                              style={{
                                width: `${(completedSubitems / totalSubitems) * 100}%`,
                              }}
                            />
                          </div>
                          <span>
                            {completedSubitems}/{totalSubitems}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <RFPStatusBadge status={rfp.status} />
                      {stage.status !== "AWAITING_RESPONSE" && (
                        <button
                          onClick={() => handleMoveNext(rfp)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          title="Move to next stage"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {stageRFPs.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">
                  No RFPs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
