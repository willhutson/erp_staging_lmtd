"use client";

import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BriefDeadlineMarker } from "../actions/brief-deadline-actions";

interface BriefDeadlineMarkerProps {
  deadline: BriefDeadlineMarker;
  compact?: boolean;
  onClick?: (deadline: BriefDeadlineMarker) => void;
}

// Brief type colors
const briefTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  VIDEO_SHOOT: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  VIDEO_EDIT: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  DESIGN: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  COPYWRITING_EN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  COPYWRITING_AR: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  PAID_MEDIA: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  REPORT: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
};

const briefTypeLabels: Record<string, string> = {
  VIDEO_SHOOT: "Shoot",
  VIDEO_EDIT: "Edit",
  DESIGN: "Design",
  COPYWRITING_EN: "Copy EN",
  COPYWRITING_AR: "Copy AR",
  PAID_MEDIA: "Paid Media",
  REPORT: "Report",
};

export function BriefDeadlineMarkerCard({
  deadline,
  compact = false,
  onClick,
}: BriefDeadlineMarkerProps) {
  const colors = briefTypeColors[deadline.type] || briefTypeColors.REPORT;
  const isOverdue = new Date(deadline.deadline) < new Date();

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(deadline)}
        className={cn(
          "w-full px-1.5 py-0.5 text-xs rounded border-l-2 truncate text-left transition-colors",
          isOverdue
            ? "bg-red-50 border-red-500 text-red-700"
            : `${colors.bg} ${colors.border} ${colors.text}`,
          onClick && "hover:opacity-80 cursor-pointer"
        )}
        title={`${deadline.title} - ${deadline.client.name}`}
      >
        <span className="flex items-center gap-1">
          {isOverdue && <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />}
          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{deadline.briefNumber}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(deadline)}
      className={cn(
        "w-full p-2 rounded-[var(--ltd-radius-md)] border text-left transition-colors",
        isOverdue
          ? "bg-red-50 border-red-200"
          : `${colors.bg} ${colors.border}`,
        onClick && "hover:shadow-sm cursor-pointer"
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center",
          isOverdue ? "bg-red-100" : colors.bg
        )}>
          {isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              colors.bg,
              colors.text
            )}>
              {briefTypeLabels[deadline.type] || deadline.type}
            </span>
            <span className="text-xs text-ltd-text-3">
              {deadline.briefNumber}
            </span>
          </div>
          <p className={cn(
            "text-sm font-medium mt-0.5 truncate",
            isOverdue ? "text-red-700" : "text-ltd-text-1"
          )}>
            {deadline.title}
          </p>
          <p className="text-xs text-ltd-text-2 truncate">
            {deadline.client.name}
            {deadline.assignee && ` • ${deadline.assignee.name}`}
          </p>
        </div>
      </div>
    </button>
  );
}

interface BriefDeadlineListProps {
  deadlines: BriefDeadlineMarker[];
  onDeadlineClick?: (deadline: BriefDeadlineMarker) => void;
  maxDisplay?: number;
}

export function BriefDeadlineList({
  deadlines,
  onDeadlineClick,
  maxDisplay = 3,
}: BriefDeadlineListProps) {
  const displayDeadlines = deadlines.slice(0, maxDisplay);
  const remaining = deadlines.length - maxDisplay;

  if (deadlines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {displayDeadlines.map((deadline) => (
        <BriefDeadlineMarkerCard
          key={deadline.id}
          deadline={deadline}
          compact
          onClick={onDeadlineClick}
        />
      ))}
      {remaining > 0 && (
        <div className="text-xs text-ltd-text-3 text-center py-0.5">
          +{remaining} more deadline{remaining > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
