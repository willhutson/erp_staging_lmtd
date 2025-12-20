import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";

export async function UpcomingDeadlinesWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const briefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      deadline: {
        gte: now,
        lte: nextWeek,
      },
      status: {
        notIn: ["COMPLETED", "CANCELLED"],
      },
    },
    include: {
      client: true,
      assignee: true,
    },
    orderBy: { deadline: "asc" },
    take: 5,
  });

  if (briefs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {briefs.map((brief) => {
        const daysUntil = Math.ceil(
          (new Date(brief.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isUrgent = daysUntil <= 2;

        return (
          <Link
            key={brief.id}
            href={`/briefs/${brief.id}`}
            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {brief.title}
                </p>
                <p className="text-xs text-gray-500">
                  {brief.assignee?.name || "Unassigned"}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  isUrgent
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {isUrgent && <AlertCircle className="w-3 h-3" />}
                {daysUntil === 0
                  ? "Today"
                  : daysUntil === 1
                  ? "Tomorrow"
                  : `${daysUntil} days`}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
