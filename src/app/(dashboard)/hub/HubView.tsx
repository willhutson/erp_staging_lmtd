import { Suspense } from "react";
import type { PermissionLevel } from "@prisma/client";
import { HubGreeting } from "./components/HubGreeting";
import { FocusTodayWidget } from "./components/FocusTodayWidget";
import { MyClientsWidget } from "./components/MyClientsWidget";
import { TeamCapacityWidget } from "@/modules/dashboard/components/widgets/TeamCapacityWidget";
import { MyBriefedTasksWidget } from "@/modules/dashboard/components/widgets/MyBriefedTasksWidget";
import { PipelineSummaryWidget } from "@/modules/dashboard/components/widgets/PipelineSummaryWidget";
import { NPSScoreWidget } from "@/modules/dashboard/components/widgets/NPSScoreWidget";
import { MyTasksWidget } from "@/modules/dashboard/components/widgets/MyTasksWidget";
import { UpcomingDeadlinesWidget } from "@/modules/dashboard/components/widgets/UpcomingDeadlinesWidget";
import { TimeLoggedWidget } from "@/modules/dashboard/components/widgets/TimeLoggedWidget";
import { WidgetSkeleton } from "./components/WidgetSkeleton";

interface HubViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    permissionLevel: PermissionLevel;
    department: string | null;
    role: string | null;
  };
}

export function HubView({ user }: HubViewProps) {
  const isLeadership = ["ADMIN", "LEADERSHIP"].includes(user.permissionLevel);
  const isTeamLead = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(user.permissionLevel);
  const isAM = user.department === "CLIENT_SERVICES" || user.role?.toLowerCase().includes("account");
  const isCreative = ["CREATIVE", "DESIGN", "PRODUCTION"].includes(user.department || "") ||
    user.role?.toLowerCase().includes("design") ||
    user.role?.toLowerCase().includes("edit") ||
    user.role?.toLowerCase().includes("motion") ||
    user.role?.toLowerCase().includes("creative");
  const isStaff = user.permissionLevel === "STAFF" || user.permissionLevel === "FREELANCER";

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <HubGreeting userName={user.name} />

      {/* Focus Today - Everyone gets this */}
      <Suspense fallback={<WidgetSkeleton title="Your Focus Today" height="h-48" />}>
        <FocusTodayWidget userId={user.id} />
      </Suspense>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - My Work */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Account Managers: My Briefed Tasks */}
          {(isAM || isTeamLead) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">My Briefed Tasks</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-64" />}>
                  <MyBriefedTasksWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* Leadership: Pipeline Summary */}
          {isLeadership && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">Pipeline Overview</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-48" />}>
                  <PipelineSummaryWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* My Clients (for AMs) */}
          {isAM && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">My Clients</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-48" />}>
                  <MyClientsWidget userId={user.id} />
                </Suspense>
              </div>
            </div>
          )}

          {/* Creative Staff: My Assigned Tasks */}
          {isCreative && !isAM && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">My Assigned Briefs</h3>
                <a href="/briefs?assignee=me" className="text-xs text-[#1BA098] hover:underline">
                  View all
                </a>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-64" />}>
                  <MyTasksWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* Staff: Upcoming Deadlines */}
          {isStaff && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">Upcoming Deadlines</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-48" />}>
                  <UpcomingDeadlinesWidget />
                </Suspense>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Team & Metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Team Capacity */}
          {isTeamLead && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">Team Capacity</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-64" />}>
                  <TeamCapacityWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* NPS Score */}
          {isLeadership && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">Client Health</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-32" />}>
                  <NPSScoreWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* Time Logged This Week - Staff/Creatives */}
          {(isCreative || isStaff) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900 text-sm">My Time This Week</h3>
              </div>
              <div className="p-4">
                <Suspense fallback={<WidgetSkeleton height="h-24" />}>
                  <TimeLoggedWidget />
                </Suspense>
              </div>
            </div>
          )}

          {/* Quick Stats Card - Everyone */}
          <QuickStatsCard permissionLevel={user.permissionLevel} isCreative={isCreative} />
        </div>
      </div>
    </div>
  );
}

function QuickStatsCard({
  permissionLevel,
  isCreative = false,
}: {
  permissionLevel: PermissionLevel;
  isCreative?: boolean;
}) {
  const isLeadership = ["ADMIN", "LEADERSHIP"].includes(permissionLevel);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 text-sm">Quick Actions</h3>
      </div>
      <div className="p-4 space-y-2">
        {!isCreative && (
          <a
            href="/briefs/new"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#52EDC7]/10 text-[#1BA098] hover:bg-[#52EDC7]/20 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Brief
          </a>
        )}
        {isCreative && (
          <a
            href="/briefs?assignee=me"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#52EDC7]/10 text-[#1BA098] hover:bg-[#52EDC7]/20 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Briefs
          </a>
        )}
        <a
          href="/time"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Log Time
        </a>
        {isLeadership && (
          <a
            href="/pipeline"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            View Pipeline
          </a>
        )}
        <a
          href="/leave"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Request Leave
        </a>
        <a
          href="/settings/delegation"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          My Delegate
        </a>
      </div>
    </div>
  );
}
