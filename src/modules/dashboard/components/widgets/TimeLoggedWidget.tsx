import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function TimeLoggedWidget() {
  const session = await auth();
  if (!session?.user) return null;

  // Get this week's time entries
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const timeEntries = await db.timeEntry.findMany({
    where: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      date: {
        gte: startOfWeek,
      },
    },
  });

  const totalHours = timeEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0
  );

  const weeklyCapacity = 40; // TODO: Get from user settings
  const percentage = Math.min(100, (totalHours / weeklyCapacity) * 100);

  // Group by day for the chart
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hoursByDay = dayNames.map((_, idx) => {
    const dayEntries = timeEntries.filter((entry) => {
      const entryDay = new Date(entry.date).getDay();
      return entryDay === idx;
    });
    return dayEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
  });

  const maxHours = Math.max(...hoursByDay, 8); // At least 8 for scale

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-500">of {weeklyCapacity}h target</p>
        </div>
        <div className="w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#52EDC7"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="flex items-end gap-1 h-16">
        {hoursByDay.map((hours, idx) => {
          const height = maxHours > 0 ? (hours / maxHours) * 100 : 0;
          const isToday = idx === now.getDay();

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all ${
                  isToday ? "bg-[#52EDC7]" : "bg-gray-200"
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              <span className={`text-[10px] ${isToday ? "font-bold text-gray-900" : "text-gray-400"}`}>
                {dayNames[idx][0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
