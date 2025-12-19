"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { TimeEntryForm } from "./TimeEntryForm";
import { deleteTimeEntry } from "../actions/timer-actions";
import type { TimeEntry, Brief, Client } from "@prisma/client";
import { cn } from "@/lib/utils";

type TimeEntryWithBrief = TimeEntry & {
  brief: (Brief & { client: Client }) | null;
};

interface WeeklyTimesheetProps {
  entries: TimeEntryWithBrief[];
  briefs: (Brief & { client: Client })[];
}

export function WeeklyTimesheet({ entries, briefs }: WeeklyTimesheetProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | undefined>();
  const [, startTransition] = useTransition();

  // Get week dates
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  const getTotalForDate = (date: Date) => {
    return getEntriesForDate(date).reduce((sum, e) => sum + Number(e.hours), 0);
  };

  const getWeekTotal = () => {
    return weekDates.reduce((sum, date) => sum + getTotalForDate(date), 0);
  };

  const handleDelete = (entryId: string) => {
    if (!confirm("Delete this time entry?")) return;

    startTransition(async () => {
      try {
        await deleteTimeEntry(entryId);
      } catch (error) {
        console.error("Failed to delete entry:", error);
      }
    });
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900 min-w-[200px] text-center">
            {formatWeekRange()}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-sm text-[#1BA098] hover:underline ml-2"
            >
              Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Week total: <strong>{getWeekTotal().toFixed(1)}h</strong>
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Timesheet grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDates.map((date, i) => (
            <div
              key={i}
              className={cn(
                "p-3 text-center border-r border-gray-100 last:border-r-0",
                isToday(date) && "bg-[#52EDC7]/10"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium",
                  isToday(date) ? "text-[#1BA098]" : "text-gray-900"
                )}
              >
                {formatDate(date)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {getTotalForDate(date).toFixed(1)}h
              </div>
            </div>
          ))}
        </div>

        {/* Entries */}
        <div className="grid grid-cols-7 min-h-[300px]">
          {weekDates.map((date, i) => {
            const dayEntries = getEntriesForDate(date);
            return (
              <div
                key={i}
                className={cn(
                  "p-2 border-r border-gray-100 last:border-r-0",
                  isToday(date) && "bg-[#52EDC7]/5"
                )}
              >
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-50 rounded-lg p-2 text-xs group relative"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {Number(entry.hours).toFixed(1)}h
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Edit2 className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                      {entry.brief && (
                        <p className="text-gray-600 truncate">
                          {entry.brief.client.code}
                        </p>
                      )}
                      {entry.description && (
                        <p className="text-gray-500 truncate">
                          {entry.description}
                        </p>
                      )}
                      {!entry.isBillable && (
                        <span className="text-gray-400 text-[10px]">
                          Non-billable
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form modal */}
      {(showForm || editingEntry) && (
        <TimeEntryForm
          briefs={briefs}
          entry={editingEntry}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(undefined);
          }}
        />
      )}
    </div>
  );
}
