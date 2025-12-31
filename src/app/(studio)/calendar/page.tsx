import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get current month/year for display
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Social Calendar</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Plan and schedule content across platforms
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors">
            <ChevronLeft className="w-4 h-4 text-ltd-text-1" />
          </button>
          <button className="p-2 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors">
            <ChevronRight className="w-4 h-4 text-ltd-text-1" />
          </button>
          <h2 className="text-lg font-semibold text-ltd-text-1 ml-2">
            {monthName} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] bg-ltd-surface-3 text-ltd-text-1 font-medium">
            Month
          </button>
          <button className="px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
            Week
          </button>
          <button className="px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
            List
          </button>
          <div className="w-px h-6 bg-ltd-border-1 mx-1" />
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* Calendar Grid Placeholder */}
      <div className="flex-1 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-ltd-border-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-ltd-text-3 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body - Empty State */}
        <div className="h-[calc(100%-40px)] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">No content scheduled</h3>
            <p className="text-sm text-ltd-text-2 mb-4">
              Start planning your social content. Drag and drop to reschedule, connect to Marketing for publishing.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
              <Plus className="w-4 h-4" />
              Schedule Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
