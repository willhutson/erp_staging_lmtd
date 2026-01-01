import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LeaveBalanceCard } from "@/modules/leave/components/LeaveBalanceCard";
import { LeaveRequestList } from "@/modules/leave/components/LeaveRequestList";
import { BlackoutList } from "@/modules/leave/components/BlackoutList";
import { initializeLeaveTypes } from "@/modules/leave/actions/leave-actions";
import { PageShell } from "@/components/ltd/patterns/page-shell";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function LeavePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const canManage = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(
    session.user.permissionLevel
  );

  // Initialize leave types if needed
  await initializeLeaveTypes(session.user.organizationId);

  // Get leave types (used for initializing balances)
  await db.leaveType.findMany({
    where: { organizationId: session.user.organizationId, isActive: true },
    orderBy: { name: "asc" },
  });

  // Get user's leave balance
  const balances = await db.leaveBalance.findMany({
    where: { userId: session.user.id, year: currentYear },
    include: { leaveType: true },
  });

  // Get user's leave requests
  const myRequests = await db.leaveRequest.findMany({
    where: { userId: session.user.id },
    include: {
      leaveType: true,
      user: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Get pending requests for team leads/managers
  let pendingRequests: typeof myRequests = [];
  if (canManage) {
    const whereClause: { organizationId: string; status: "PENDING"; user?: { teamLeadId: string } } = {
      organizationId: session.user.organizationId,
      status: "PENDING" as const,
    };

    // Team leads only see their team's requests
    if (session.user.permissionLevel === "TEAM_LEAD") {
      whereClause.user = { teamLeadId: session.user.id };
    }

    pendingRequests = await db.leaveRequest.findMany({
      where: whereClause,
      include: {
        leaveType: true,
        user: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // Get blackout periods
  const blackouts = await db.blackoutPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        {
          startDate: { gte: new Date(currentYear, 0, 1) },
          endDate: { lte: new Date(currentYear, 11, 31) },
        },
        { isRecurring: true },
      ],
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
    orderBy: { startDate: "asc" },
  });

  // Get clients for blackout form
  const clients = await db.client.findMany({
    where: { organizationId: session.user.organizationId, isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageShell
      title="Leave"
      description="Manage leave requests and time off"
      actions={
        <Link
          href="/leave/request"
          className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Request Leave
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Balance and Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals (for managers) */}
          {pendingRequests.length > 0 && (
            <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
              <div className="p-4 border-b border-ltd-border-1">
                <h2 className="font-semibold text-ltd-text-1">
                  Pending Approvals
                  <span className="ml-2 px-2 py-0.5 text-xs bg-ltd-warning/20 text-ltd-warning rounded-full">
                    {pendingRequests.length}
                  </span>
                </h2>
              </div>
              <LeaveRequestList
                requests={pendingRequests}
                showUser
                canReview
                currentUserId={session.user.id}
              />
            </div>
          )}

          {/* My Requests */}
          <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
            <div className="p-4 border-b border-ltd-border-1">
              <h2 className="font-semibold text-ltd-text-1">My Requests</h2>
            </div>
            <LeaveRequestList
              requests={myRequests}
              currentUserId={session.user.id}
            />
          </div>
        </div>

        {/* Right column - Balance and Blackouts */}
        <div className="space-y-6">
          <LeaveBalanceCard balances={balances} />
          <BlackoutList
            blackouts={blackouts}
            clients={clients}
            canManage={["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)}
          />
        </div>
      </div>
    </PageShell>
  );
}
