"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import type { LeaveType } from "@prisma/client";
import { createLeaveRequest } from "../actions/leave-actions";
import { cn } from "@/lib/utils";

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  onSuccess?: () => void;
}

export function LeaveRequestForm({ leaveTypes, onSuccess }: LeaveRequestFormProps) {
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Leave Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Leave Type
        </label>
        <select
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
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
            className="w-4 h-4 rounded border-gray-300 text-[#52EDC7] focus:ring-[#52EDC7]"
          />
          <span className="text-sm text-gray-700">Half day only</span>
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Afternoon
            </button>
          </div>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Add any notes for your manager..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
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
