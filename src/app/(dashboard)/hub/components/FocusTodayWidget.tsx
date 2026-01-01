import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { AlertCircle, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusTodayWidgetProps {
  userId: string;
}

export async function FocusTodayWidget({ userId }: FocusTodayWidgetProps) {
  const session = await auth();
  if (!session?.user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get overdue briefs (assigned to user)
  const overdueBriefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      assigneeId: userId,
      deadline: { lt: today },
      status: { notIn: ["DRAFT", "CANCELLED", "COMPLETED"] },
    },
    include: { client: { select: { name: true, code: true } } },
    orderBy: { deadline: "asc" },
    take: 5,
  });

  // Get due today briefs
  const dueTodayBriefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      assigneeId: userId,
      deadline: { gte: today, lt: tomorrow },
      status: { notIn: ["DRAFT", "CANCELLED", "COMPLETED"] },
    },
    include: { client: { select: { name: true, code: true } } },
    orderBy: { deadline: "asc" },
    take: 5,
  });

  // Get pending approvals/reviews
  const pendingReviews = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        { assigneeId: userId },
        { createdById: userId },
      ],
      status: { in: ["INTERNAL_REVIEW", "CLIENT_REVIEW", "REVISIONS"] },
    },
    include: { client: { select: { name: true, code: true } } },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  const hasItems = overdueBriefs.length > 0 || dueTodayBriefs.length > 0 || pendingReviews.length > 0;

  if (!hasItems) {
    return (
      <div className="bg-gradient-to-r from-[#52EDC7]/5 to-[#52EDC7]/10 rounded-xl border border-[#52EDC7]/20 p-6">
        <div className="text-center text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-[#52EDC7]" />
          <p className="font-medium text-gray-900">All caught up!</p>
          <p className="text-sm mt-1">No urgent items for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="font-medium text-gray-900">Your Focus Today</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Overdue Section */}
        {overdueBriefs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium text-sm">
                Overdue ({overdueBriefs.length})
              </span>
            </div>
            <div className="space-y-2">
              {overdueBriefs.map((brief) => (
                <FocusItem
                  key={brief.id}
                  brief={brief}
                  variant="overdue"
                />
              ))}
            </div>
          </div>
        )}

        {/* Due Today Section */}
        {dueTodayBriefs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">
                Due Today ({dueTodayBriefs.length})
              </span>
            </div>
            <div className="space-y-2">
              {dueTodayBriefs.map((brief) => (
                <FocusItem
                  key={brief.id}
                  brief={brief}
                  variant="today"
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="font-medium text-sm">
                Pending Feedback ({pendingReviews.length})
              </span>
            </div>
            <div className="space-y-2">
              {pendingReviews.map((brief) => (
                <FocusItem
                  key={brief.id}
                  brief={brief}
                  variant="review"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface Brief {
  id: string;
  title: string;
  deadline: Date | null;
  client: { name: string; code: string };
}

function FocusItem({
  brief,
  variant,
}: {
  brief: Brief;
  variant: "overdue" | "today" | "review";
}) {
  const variantStyles = {
    overdue: "bg-red-50 border-red-100 hover:bg-red-100",
    today: "bg-amber-50 border-amber-100 hover:bg-amber-100",
    review: "bg-blue-50 border-blue-100 hover:bg-blue-100",
  };

  const daysOverdue = brief.deadline
    ? Math.floor((new Date().getTime() - new Date(brief.deadline).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Link
      href={`/briefs/${brief.id}`}
      className={cn(
        "block p-3 rounded-lg border transition-colors",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {brief.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {brief.client.code}
          </p>
        </div>
        {variant === "overdue" && daysOverdue > 0 && (
          <span className="text-xs font-medium text-red-600">
            {daysOverdue} day{daysOverdue === 1 ? "" : "s"} overdue
          </span>
        )}
      </div>
    </Link>
  );
}
