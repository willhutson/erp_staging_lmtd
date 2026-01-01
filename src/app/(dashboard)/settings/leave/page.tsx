import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, Calendar, Ban, PartyPopper } from "lucide-react";

// Inferred types for Prisma records
type LeaveTypeRecord = Awaited<ReturnType<typeof db.leaveType.findMany>>[number];
type PublicHolidayRecord = Awaited<ReturnType<typeof db.publicHoliday.findMany>>[number];
type BlackoutPeriodWithClient = Awaited<
  ReturnType<
    typeof db.blackoutPeriod.findMany<{
      include: { client: { select: { name: true; code: true } } };
    }>
  >
>[number];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function LeaveSettingsPage() {
  const session = await auth();

  const [leaveTypes, publicHolidays, blackoutPeriods] = await Promise.all([
    db.leaveType.findMany({
      where: { organizationId: session!.user.organizationId },
      orderBy: { name: "asc" },
    }),
    db.publicHoliday.findMany({
      where: {
        organizationId: session!.user.organizationId,
        year: new Date().getFullYear(),
      },
      orderBy: { date: "asc" },
    }),
    db.blackoutPeriod.findMany({
      where: { organizationId: session!.user.organizationId },
      include: { client: { select: { name: true, code: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Leave Types */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Types</h2>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
            Add Type
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {leaveTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No leave types configured. Add your first leave type.
            </div>
          ) : (
            leaveTypes.map((type: LeaveTypeRecord) => (
              <div key={type.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type.defaultDays} days/year
                      {type.carryOverLimit > 0 && ` • ${type.carryOverLimit} carryover`}
                      {!type.isPaid && " • Unpaid"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      type.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Public Holidays */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Public Holidays {new Date().getFullYear()}
            </h2>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
            Add Holiday
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {publicHolidays.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No public holidays configured for {new Date().getFullYear()}.
            </div>
          ) : (
            publicHolidays.map((holiday: PublicHolidayRecord) => (
              <div key={holiday.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(holiday.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {holiday.isOptional && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                      Optional
                    </span>
                  )}
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Blackout Periods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Blackout Periods</h2>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
            Add Blackout
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {blackoutPeriods.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No blackout periods configured. Blackouts prevent leave requests during critical times.
            </div>
          ) : (
            blackoutPeriods.map((period: BlackoutPeriodWithClient) => (
              <div key={period.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{period.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(period.startDate)} – {formatDate(period.endDate)}
                    {period.client && ` • ${period.client.name}`}
                  </p>
                  {period.reason && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{period.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {period.isRecurring && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Recurring
                    </span>
                  )}
                  <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
