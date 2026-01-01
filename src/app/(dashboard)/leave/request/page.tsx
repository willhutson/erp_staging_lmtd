import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeaveRequestForm } from "@/modules/leave/components/LeaveRequestForm";
import { LeaveBalanceCard } from "@/modules/leave/components/LeaveBalanceCard";
import { initializeLeaveTypes } from "@/modules/leave/actions/leave-actions";

// Inferred type for blackout periods with client
type BlackoutPeriodWithClient = Awaited<
  ReturnType<
    typeof db.blackoutPeriod.findMany<{
      include: { client: { select: { id: true; name: true; code: true } } };
    }>
  >
>[number];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function LeaveRequestPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  // Initialize leave types if needed
  await initializeLeaveTypes(session.user.organizationId);

  // Get user's team lead (the person who will approve the request)
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      teamLead: { select: { id: true, name: true } },
    },
  });

  // Get leave types
  const leaveTypes = await db.leaveType.findMany({
    where: { organizationId: session.user.organizationId, isActive: true },
    orderBy: { name: "asc" },
  });

  // Get user's leave balance
  const balances = await db.leaveBalance.findMany({
    where: { userId: session.user.id, year: currentYear },
    include: { leaveType: true },
  });

  // Get upcoming blackouts
  const blackouts = await db.blackoutPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      endDate: { gte: new Date() },
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/leave"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request Leave</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Submit a new leave request</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <LeaveRequestForm
              leaveTypes={leaveTypes}
              approverName={currentUser?.teamLead?.name || null}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LeaveBalanceCard balances={balances} />

          {/* Upcoming Blackouts Warning */}
          {blackouts.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
              <h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
                Upcoming Blackout Periods
              </h3>
              <div className="space-y-2 text-sm text-orange-700 dark:text-orange-400">
                {blackouts.map((blackout: BlackoutPeriodWithClient) => (
                  <div key={blackout.id}>
                    <p className="font-medium">{blackout.name}</p>
                    <p className="text-orange-600 dark:text-orange-500">
                      {new Date(blackout.startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      –{" "}
                      {new Date(blackout.endDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                      {blackout.client && ` (${blackout.client.code})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
