"use client";

import { useMemo } from "react";
import type { Brief, Client, User } from "@prisma/client";
import { cn } from "@/lib/utils";

type BriefWithRelations = Brief & { client: Client; assignee: User | null };

interface GanttTimelineProps {
  briefs: BriefWithRelations[];
  users: User[];
}

export function GanttTimeline({ briefs, users }: GanttTimelineProps) {
  // Generate 14 days from today
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  // Group briefs by assignee
  const briefsByUser = useMemo(() => {
    const map = new Map<string, BriefWithRelations[]>();

    // Add unassigned
    map.set("unassigned", briefs.filter((b) => !b.assigneeId));

    // Group by assignee
    users.forEach((user) => {
      map.set(user.id, briefs.filter((b) => b.assigneeId === user.id));
    });

    return map;
  }, [briefs, users]);

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getBriefPosition = (brief: BriefWithRelations) => {
    const formData = brief.formData as Record<string, unknown>;
    const shootDate = formData.shootDate as { start?: string; end?: string } | undefined;
    const startDate = shootDate?.start || (formData.deadline as string) || brief.createdAt;
    const endDate = shootDate?.end || (formData.deadline as string) || brief.createdAt;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayWidth = 100 / 14;
    const startOffset = Math.max(0, (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);

    return {
      left: `${startOffset * dayWidth}%`,
      width: `${Math.min(duration * dayWidth, (14 - startOffset) * dayWidth)}%`,
      visible: startOffset < 14,
    };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with days */}
      <div className="flex border-b border-gray-200">
        <div className="w-48 shrink-0 p-3 bg-gray-50 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-700">Team Member</span>
        </div>
        <div className="flex-1 flex">
          {days.map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 p-2 text-center text-xs border-r border-gray-100 last:border-r-0",
                isToday(day) && "bg-[#52EDC7]/10",
                isWeekend(day) && "bg-gray-50"
              )}
            >
              <div className={cn("font-medium", isToday(day) && "text-[#1BA098]")}>
                {formatDay(day)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from(briefsByUser.entries()).map(([userId, userBriefs]) => {
          if (userBriefs.length === 0) return null;

          const user = userId === "unassigned" ? null : users.find((u) => u.id === userId);
          const userName = user?.name || "Unassigned";

          return (
            <div key={userId} className="flex min-h-[60px]">
              <div className="w-48 shrink-0 p-3 bg-gray-50 border-r border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#52EDC7] flex items-center justify-center text-xs font-medium text-gray-900">
                    {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userName.split(" ")[0]}
                    </p>
                    <p className="text-xs text-gray-500">{userBriefs.length} briefs</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative p-1">
                {/* Today line */}
                <div className="absolute top-0 bottom-0 left-[calc(100%/14/2)] w-0.5 bg-[#52EDC7] z-10" />

                {/* Briefs */}
                {userBriefs.map((brief) => {
                  const pos = getBriefPosition(brief);
                  if (!pos.visible) return null;

                  return (
                    <div
                      key={brief.id}
                      className="absolute top-1/2 -translate-y-1/2 h-8 bg-purple-500 rounded text-white text-xs flex items-center px-2 truncate cursor-pointer hover:bg-purple-600 transition-colors"
                      style={{ left: pos.left, width: pos.width, minWidth: "60px" }}
                      title={brief.title}
                    >
                      {brief.client.code}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {briefs.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No briefs with dates to display
        </div>
      )}
    </div>
  );
}
