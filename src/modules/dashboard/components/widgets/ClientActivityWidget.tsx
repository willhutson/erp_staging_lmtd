import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Mail, Phone, Users, FileText, MessageSquare } from "lucide-react";

const activityIcons = {
  NOTE: MessageSquare,
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Users,
  TASK: FileText,
  STATUS_CHANGE: FileText,
};

export async function ClientActivityWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const activities = await db.clientActivity.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      client: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || FileText;

        return (
          <Link
            key={activity.id}
            href={`/clients/${activity.clientId}`}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {activity.client.name} • {activity.user.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      })}
      <Link
        href="/clients"
        className="block text-center text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
      >
        View all clients
      </Link>
    </div>
  );
}
