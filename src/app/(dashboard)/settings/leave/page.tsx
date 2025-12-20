import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { Plus, Calendar, Ban, PartyPopper } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        <div className="lg:col-span-3 space-y-6">
          {/* Leave Types */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Leave Types</h2>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
                Add Type
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {leaveTypes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No leave types configured. Add your first leave type.
                </div>
              ) : (
                leaveTypes.map((type) => (
                  <div key={type.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.name}</p>
                        <p className="text-sm text-gray-500">
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
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Public Holidays */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Public Holidays {new Date().getFullYear()}
                </h2>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
                Add Holiday
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {publicHolidays.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No public holidays configured for {new Date().getFullYear()}.
                </div>
              ) : (
                publicHolidays.map((holiday) => (
                  <div key={holiday.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{holiday.name}</p>
                      <p className="text-sm text-gray-500">{formatDate(holiday.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {holiday.isOptional && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Optional
                        </span>
                      )}
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blackout Periods */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Blackout Periods</h2>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
                Add Blackout
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {blackoutPeriods.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No blackout periods configured. Blackouts prevent leave requests during critical times.
                </div>
              ) : (
                blackoutPeriods.map((period) => (
                  <div key={period.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{period.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(period.startDate)} – {formatDate(period.endDate)}
                        {period.client && ` • ${period.client.name}`}
                      </p>
                      {period.reason && (
                        <p className="text-sm text-gray-400 mt-1">{period.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {period.isRecurring && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Recurring
                        </span>
                      )}
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
