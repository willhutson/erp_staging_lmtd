import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GlobalTimer } from "@/modules/time-tracking/components/GlobalTimer";
import { WeeklyTimesheet } from "@/modules/time-tracking/components/WeeklyTimesheet";
import { PageShell } from "@/components/ltd/patterns/page-shell";

export default async function TimePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Get running timer
  const runningTimer = await db.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      isRunning: true,
    },
    include: {
      brief: {
        include: {
          client: true,
        },
      },
    },
  });

  // Get user's time entries for the past month
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [entries, briefs, user] = await Promise.all([
    db.timeEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        brief: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { date: "desc" },
    }),
    db.brief.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: {
          notIn: ["DRAFT", "CANCELLED", "COMPLETED"],
        },
      },
      include: {
        client: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { weeklyCapacity: true },
    }),
  ]);

  // Calculate summary stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diff);

  const hoursToday = entries
    .filter((e) => {
      const entryDate = new Date(e.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    })
    .reduce((sum, e) => sum + Number(e.hours), 0);

  const hoursThisWeek = entries
    .filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= startOfWeek;
    })
    .reduce((sum, e) => sum + Number(e.hours), 0);

  const weeklyTarget = user?.weeklyCapacity || 40;
  const utilizationPercent = Math.round((hoursThisWeek / weeklyTarget) * 100);

  const formatHoursMinutes = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <PageShell
      title="Time Tracking"
      description="Track time on briefs and projects"
    >
      {/* Timer */}
      <GlobalTimer initialTimer={runningTimer} briefs={briefs} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">Today</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">
            {formatHoursMinutes(hoursToday)}
          </p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">This Week</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">
            {formatHoursMinutes(hoursThisWeek)}
          </p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">Weekly Target</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">{weeklyTarget}h</p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">Utilization</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">
            {utilizationPercent}%
          </p>
          <div className="h-1.5 bg-ltd-surface-3 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-ltd-primary rounded-full"
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timesheet */}
      <WeeklyTimesheet entries={entries} briefs={briefs} />
    </PageShell>
  );
}
