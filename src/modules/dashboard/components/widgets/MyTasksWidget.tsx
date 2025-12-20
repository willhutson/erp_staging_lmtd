import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";

export async function MyTasksWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const briefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      assigneeId: session.user.id,
      status: {
        in: ["APPROVED", "IN_PROGRESS", "REVISIONS", "INTERNAL_REVIEW"],
      },
    },
    include: {
      client: true,
    },
    orderBy: [{ priority: "desc" }, { deadline: "asc" }],
    take: 5,
  });

  if (briefs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p className="text-sm">No active tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {briefs.map((brief) => (
        <Link
          key={brief.id}
          href={`/briefs/${brief.id}`}
          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {brief.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{brief.client.name}</p>
            </div>
            <StatusBadge status={brief.status} size="sm" />
          </div>
          {brief.deadline && (
            <p className="text-xs text-gray-400 mt-1">
              Due{" "}
              {new Date(brief.deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </p>
          )}
        </Link>
      ))}
      <Link
        href="/briefs?assignee=me"
        className="block text-center text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
      >
        View all tasks
      </Link>
    </div>
  );
}
