export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from "lucide-react";

async function getMonthLeave(year: number, month: number) {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  const result = await prisma.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      OR: [
        {
          startDate: { gte: startOfMonth, lte: endOfMonth },
        },
        {
          endDate: { gte: startOfMonth, lte: endOfMonth },
        },
        {
          AND: [
            { startDate: { lte: startOfMonth } },
            { endDate: { gte: endOfMonth } },
          ],
        },
      ],
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      leaveType: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });
  return result;
}

type LeaveEntry = Awaited<ReturnType<typeof getMonthLeave>>[number];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function LeaveCalendarPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  let leaves: Awaited<ReturnType<typeof getMonthLeave>> = [];

  try {
    leaves = await getMonthLeave(currentYear, currentMonth);
  } catch {
    // Fallback to empty
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Group leaves by date
  const leavesByDate: Record<number, typeof leaves> = {};
  leaves.forEach((leave: LeaveEntry) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDate();
        if (!leavesByDate[day]) leavesByDate[day] = [];
        leavesByDate[day].push(leave);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/leave">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leave Calendar</h1>
            <p className="text-muted-foreground">
              Team availability at a glance
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/leave/request">
            <Plus className="mr-2 h-4 w-4" />
            Request Leave
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{MONTH_NAMES[currentMonth]} {currentYear}</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
            {/* Day Headers */}
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, idx) => {
              const isToday = day === today.getDate();
              const dayLeaves = day ? leavesByDate[day] || [] : [];

              return (
                <div
                  key={idx}
                  className={`bg-background min-h-[100px] p-2 ${
                    day ? "" : "bg-muted/30"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-sm ${
                          isToday
                            ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayLeaves.slice(0, 2).map((leave: LeaveEntry, i: number) => (
                          <div
                            key={`${leave.id}-${i}`}
                            className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1 py-0.5 rounded truncate"
                          >
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={leave.user?.avatarUrl || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {leave.user?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{leave.user?.name?.split(" ")[0]}</span>
                          </div>
                        ))}
                        {dayLeaves.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayLeaves.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend / Upcoming */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved leave this month</p>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave: LeaveEntry) => (
                  <div key={leave.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={leave.user?.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {leave.user?.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{leave.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {leave.leaveType?.name || "Leave"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm">Annual Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm">Sick Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm">Personal Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-sm">Parental Leave</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
