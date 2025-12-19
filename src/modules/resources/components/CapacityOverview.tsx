"use client";

import type { User, Brief } from "@prisma/client";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface CapacityOverviewProps {
  users: User[];
  briefs: Brief[];
}

export function CapacityOverview({ users, briefs }: CapacityOverviewProps) {
  // Group users by department
  const departments = Array.from(new Set(users.map((u) => u.department)));

  // Calculate hours per user (estimate: 8 hours per brief in progress)
  const hoursPerUser = new Map<string, number>();
  briefs.forEach((brief) => {
    if (brief.assigneeId && ["IN_PROGRESS", "INTERNAL_REVIEW"].includes(brief.status)) {
      const current = hoursPerUser.get(brief.assigneeId) || 0;
      hoursPerUser.set(brief.assigneeId, current + 8); // Estimate 8 hours per active brief
    }
  });

  const getDepartmentStats = (department: string) => {
    const deptUsers = users.filter((u) => u.department === department && u.isActive);
    const totalCapacity = deptUsers.reduce((sum, u) => sum + u.weeklyCapacity, 0);
    const totalAllocated = deptUsers.reduce((sum, u) => sum + (hoursPerUser.get(u.id) || 0), 0);
    const utilization = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

    return { deptUsers, totalCapacity, totalAllocated, utilization };
  };

  return (
    <div className="space-y-6">
      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const stats = getDepartmentStats(dept);
          const isOverloaded = stats.utilization > 100;

          return (
            <div
              key={dept}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 text-sm">{dept}</h3>
                {isOverloaded && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Allocated</span>
                  <span className="font-medium">
                    {stats.totalAllocated}h / {stats.totalCapacity}h
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      stats.utilization > 100
                        ? "bg-red-500"
                        : stats.utilization > 80
                        ? "bg-yellow-500"
                        : "bg-[#52EDC7]"
                    )}
                    style={{ width: `${Math.min(stats.utilization, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {stats.deptUsers.length} team members •{" "}
                  {Math.round(stats.utilization)}% utilized
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual capacity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Team Capacity</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {users
            .filter((u) => u.isActive)
            .sort((a, b) => {
              const aHours = hoursPerUser.get(a.id) || 0;
              const bHours = hoursPerUser.get(b.id) || 0;
              return bHours / b.weeklyCapacity - aHours / a.weeklyCapacity;
            })
            .slice(0, 15)
            .map((user) => {
              const allocated = hoursPerUser.get(user.id) || 0;
              const utilization = (allocated / user.weeklyCapacity) * 100;
              const isOverloaded = utilization > 100;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-[#52EDC7] flex items-center justify-center text-xs font-medium text-gray-900">
                    {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">
                        {allocated}h / {user.weeklyCapacity}h
                      </span>
                    </div>

                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isOverloaded
                            ? "bg-red-500"
                            : utilization > 80
                            ? "bg-yellow-500"
                            : "bg-[#52EDC7]"
                        )}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 w-16 text-right">
                    {user.department.split(" ")[0]}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
