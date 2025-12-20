import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

export async function TeamCapacityWidget() {
  const session = await auth();
  if (!session?.user) return null;

  // Get team members with their time entries for this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const users = await db.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      permissionLevel: { notIn: ["CLIENT", "FREELANCER"] },
    },
    select: {
      id: true,
      name: true,
      weeklyCapacity: true,
      avatarUrl: true,
      department: true,
      timeEntries: {
        where: {
          date: { gte: startOfWeek },
        },
        select: {
          hours: true,
        },
      },
    },
    orderBy: { name: "asc" },
    take: 8,
  });

  const usersWithUtilization = users.map((user) => {
    const hoursLogged = user.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );
    const utilization = Math.round(
      (hoursLogged / (user.weeklyCapacity || 40)) * 100
    );
    return {
      ...user,
      hoursLogged,
      utilization,
    };
  });

  // Sort by utilization descending
  usersWithUtilization.sort((a, b) => b.utilization - a.utilization);

  return (
    <div className="space-y-3">
      {usersWithUtilization.slice(0, 6).map((user) => {
        const isOverloaded = user.utilization > 100;
        const isLow = user.utilization < 50;

        return (
          <div key={user.id} className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <span
                  className={`text-xs font-medium ${
                    isOverloaded
                      ? "text-red-600"
                      : isLow
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {user.utilization}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverloaded
                      ? "bg-red-500"
                      : isLow
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(user.utilization, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <Link
        href="/resources"
        className="block text-center text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
      >
        View all team
      </Link>
    </div>
  );
}
