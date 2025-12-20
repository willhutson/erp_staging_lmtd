import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export async function RecentBriefsWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const briefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      client: true,
      assignee: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  if (briefs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p className="text-sm">No briefs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {briefs.map((brief) => (
        <Link
          key={brief.id}
          href={`/briefs/${brief.id}`}
          className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {brief.title}
              </p>
              <StatusBadge status={brief.status} size="sm" />
            </div>
            <p className="text-xs text-gray-500">{brief.client.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(brief.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      ))}
      <Link
        href="/briefs"
        className="block text-center text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
      >
        View all briefs
      </Link>
    </div>
  );
}
