import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";
import { AlertCircle, Clock, CheckCircle2, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BriefWithRelations {
  id: string;
  title: string;
  status: string;
  deadline: Date | null;
  client: { name: string };
  assignee: { name: string } | null;
}

function isOverdue(deadline: Date | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function needsAttention(brief: BriefWithRelations): boolean {
  // Overdue or in revision/feedback stage
  if (isOverdue(brief.deadline)) return true;
  if (["REVISIONS", "CLIENT_REVIEW", "INTERNAL_REVIEW"].includes(brief.status)) return true;
  return false;
}

function formatDeadline(deadline: Date | null): string {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

export async function MyBriefedTasksWidget() {
  const session = await auth();
  if (!session?.user) return null;

  // Fetch briefs where current user is the briefer (creator)
  const [activeBriefs, recentlyCompleted] = await Promise.all([
    db.brief.findMany({
      where: {
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        status: {
          notIn: ["DRAFT", "CANCELLED", "COMPLETED"],
        },
      },
      include: {
        client: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: [{ deadline: "asc" }],
      take: 10,
    }),
    db.brief.findMany({
      where: {
        organizationId: session.user.organizationId,
        createdById: session.user.id,
        status: "COMPLETED",
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        client: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  // Group active briefs
  const attention = activeBriefs.filter((b) => needsAttention(b));
  const inProgress = activeBriefs.filter((b) => !needsAttention(b));

  const totalBriefs = activeBriefs.length + recentlyCompleted.length;

  if (totalBriefs === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No briefed tasks</p>
        <p className="text-xs mt-1">Tasks you create will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {/* Needs Attention Section */}
      {attention.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-red-600 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="font-medium text-xs uppercase">
              Needs Attention ({attention.length})
            </span>
          </div>
          <div className="space-y-1">
            {attention.slice(0, 2).map((brief) => (
              <BriefItem key={brief.id} brief={brief} variant="attention" />
            ))}
            {attention.length > 2 && (
              <p className="text-xs text-gray-500 pl-4">
                +{attention.length - 2} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-amber-600 mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium text-xs uppercase">
              In Progress ({inProgress.length})
            </span>
          </div>
          <div className="space-y-1">
            {inProgress.slice(0, 3).map((brief) => (
              <BriefItem key={brief.id} brief={brief} variant="progress" />
            ))}
            {inProgress.length > 3 && (
              <p className="text-xs text-gray-500 pl-4">
                +{inProgress.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recently Completed Section */}
      {recentlyCompleted.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-green-600 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="font-medium text-xs uppercase">
              Recently Completed ({recentlyCompleted.length})
            </span>
          </div>
          <div className="space-y-1">
            {recentlyCompleted.slice(0, 2).map((brief) => (
              <BriefItem key={brief.id} brief={brief} variant="completed" />
            ))}
          </div>
        </div>
      )}

      {/* View All Link */}
      <Link
        href="/briefs?briefedBy=me"
        className="flex items-center justify-center gap-1 text-xs text-[#52EDC7] hover:text-[#1BA098] pt-2"
      >
        View all briefed tasks
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function BriefItem({
  brief,
  variant,
}: {
  brief: BriefWithRelations;
  variant: "attention" | "progress" | "completed";
}) {
  return (
    <Link
      href={`/briefs/${brief.id}`}
      className={cn(
        "block p-2 rounded-lg transition-colors",
        variant === "attention"
          ? "bg-red-50 hover:bg-red-100"
          : variant === "progress"
          ? "hover:bg-gray-50"
          : "hover:bg-gray-50 opacity-75"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {brief.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{brief.client.name}</span>
            {brief.assignee && (
              <>
                <span>→</span>
                <span>{brief.assignee.name.split(" ")[0]}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {variant !== "completed" && (
            <p
              className={cn(
                "text-xs",
                isOverdue(brief.deadline) ? "text-red-600 font-medium" : "text-gray-500"
              )}
            >
              {formatDeadline(brief.deadline)}
            </p>
          )}
          <StatusBadge status={brief.status} size="sm" />
        </div>
      </div>
    </Link>
  );
}
