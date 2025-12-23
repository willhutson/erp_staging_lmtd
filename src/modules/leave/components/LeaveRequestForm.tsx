"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, UserCheck } from "lucide-react";
import type { LeaveType } from "@prisma/client";
import { createLeaveRequest } from "../actions/leave-actions";
import { cn } from "@/lib/utils";

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  approverName?: string | null;
  onSuccess?: () => void;
}

export function LeaveRequestForm({ leaveTypes, approverName, onSuccess }: LeaveRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [leaveTypeId, setLeaveTypeId] = useState(leaveTypes[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<"MORNING" | "AFTERNOON">("MORNING");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select dates");
      return;
    }

    startTransition(async () => {
      try {
        await createLeaveRequest({
          leaveTypeId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: reason || undefined,
          isHalfDay,
          halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
        });
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit request");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Leave Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Leave Type
        </label>
        <select
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          required
        >
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!endDate || e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              required
            />
          </div>
        </div>
      </div>

      {/* Half Day Option */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHalfDay}
            onChange={(e) => setIsHalfDay(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#52EDC7] focus:ring-[#52EDC7]"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Half day only</span>
        </label>

        {isHalfDay && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHalfDayPeriod("MORNING")}
              className={cn(
                "px-3 py-1 text-sm rounded-lg transition-colors",
                halfDayPeriod === "MORNING"
                  ? "bg-[#52EDC7] text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              Morning
            </button>
            <button
              type="button"
              onClick={() => setHalfDayPeriod("AFTERNOON")}
              className={cn(
                "px-3 py-1 text-sm rounded-lg transition-colors",
                halfDayPeriod === "AFTERNOON"
                  ? "bg-[#52EDC7] text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              Afternoon
            </button>
          </div>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Add any notes for your manager..."
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
      </div>

      {/* Approver Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
        <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            {approverName
              ? `Your request will be reviewed by ${approverName}`
              : "Your request will be reviewed by Leadership"}
          </p>
          <p className="text-blue-600 dark:text-blue-400 mt-0.5">
            You&apos;ll be notified once a decision is made.
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
